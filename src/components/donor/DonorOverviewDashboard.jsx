/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/preserve-manual-memoization */
"use client";

import { useState, useEffect, useCallback } from "react";
import { CampaignCTA } from "@/components/campaign/CampaignCTA";
import { DonorMetricCards } from "@/components/donor/DonorMetricCards";
import { DonorMonthlyTrendChart } from "@/components/donor/DonorMonthlyTrendChart";
import { DonorRecentReportsCard } from "@/components/donor/DonorRecentReportsCard";
import { DonorCategoryDonutCard } from "@/components/donor/DonorCategoryDonutCard";
import { DonorRecentTransactionsCard } from "@/components/donor/DonorRecentTransactionsCard";
import { DonorMonthlyTargetCard } from "@/components/donor/DonorMonthlyTargetCard";
import { DonorRoutineDonationsCard } from "@/components/donor/DonorRoutineDonationsCard";
import { DonorPrayersCard } from "@/components/donor/DonorPrayersCard";
import { DonorDashboardSkeleton } from "@/components/donor/DonorDashboardSkeleton";
import { DonorPendingInvoiceBanner } from "@/components/donor/DonorPendingInvoiceBanner";
import { DataFetchErrorState } from "@/components/shared/DataFetchErrorState";
import { safeFetch } from "@/lib/safeFetch";

const MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"Mei",
	"Jun",
	"Jul",
	"Agu",
	"Sep",
	"Okt",
	"Nov",
	"Des",
];
const DEFAULT_MONTHLY_TREND = MONTH_NAMES.map((m) => ({ month: m, donasi: 0 }));

export function DonorOverviewDashboard({ currentUser }) {
	const [dashboardData, setDashboardData] = useState({
		metrics: {
			totalNominal: 0,
			totalTransactions: 0,
			totalPrograms: 0,
		},
		monthlyTrend: DEFAULT_MONTHLY_TREND,
		categoryDistribution: [],
		currentMonthAchieved: 0,
		currentMonthTarget: 1000000,
		recentReports: [],
		recentItems: [],
		routineDonations: [],
		pendingInvoices: [],
	});
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);

	const fetchDashboardData = useCallback(async ({ silent = false } = {}) => {
		if (
			!currentUser?.email &&
			!currentUser?.name
		) {
			setIsLoading(false);
			return;
		}

		if (!silent) {
			setIsLoading(true);
		}
		setFetchError(null);
		try {
			const params =
				new URLSearchParams(
					{
						mode: "dashboard",
						email:
							currentUser.email ||
							"",
						name:
							currentUser.name ||
							"",
					},
				);

			const res =
				await safeFetch(
					`/api/user/donations?${params.toString()}`,
				);
			const json =
				await res.json();

			if (
				json.success &&
				json.data
			) {
				setDashboardData(
					json.data,
				);
			} else {
				if (!silent) setFetchError(json.message || "Gagal memuat data akun.");
			}
		} catch (err) {
			console.error(
				"Gagal memuat data dashboard:",
				err,
			);
			if (!silent) setFetchError(err.message || "Koneksi terputus saat mengambil data donasi.");
		} finally {
			if (!silent) {
				setIsLoading(false);
			}
		}
	}, [currentUser?.email, currentUser?.name]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

	useEffect(() => {
		const handleSync = () => {
			if (document.visibilityState === "visible") {
				fetchDashboardData({ silent: true });
			}
		};
		window.addEventListener("visibilitychange", handleSync);
		window.addEventListener("focus", handleSync);
		return () => {
			window.removeEventListener("visibilitychange", handleSync);
			window.removeEventListener("focus", handleSync);
		};
	}, [fetchDashboardData]);

	useEffect(() => {
		if (
			!isLoading &&
			typeof window !== "undefined" &&
			window.location.hash === "#donor-routine-card"
		) {
			const el = document.getElementById("donor-routine-card");
			if (el) {
				const scrollTimer = setTimeout(() => {
					el.scrollIntoView({ behavior: "smooth", block: "center" });
					el.classList.add("ring-2", "ring-primary", "ring-offset-2");
					const ringTimer = setTimeout(() => {
						el.classList.remove("ring-2", "ring-primary", "ring-offset-2");
					}, 2000);
					return () => clearTimeout(ringTimer);
				}, 150);
				return () => clearTimeout(scrollTimer);
			}
		}
	}, [isLoading]);

	if (isLoading) {
		return <DonorDashboardSkeleton />;
	}

	const metrics = dashboardData.metrics || {
		totalNominal: 0,
		totalTransactions: 0,
		totalPrograms: 0,
	};
	const recentItems = dashboardData.recentItems || [];
	const lastDonation = recentItems[0] || null;
	const routineDonations = dashboardData.routineDonations || [];
	const hasActiveRoutine = routineDonations.some(
		(it) => it.status === "ACTIVE" || it.status === "PAUSED"
	);

	const handleInvoiceCancelled = (cancelledInvoiceId) => {
		setDashboardData((prev) => ({
			...prev,
			pendingInvoices: (prev.pendingInvoices || []).filter(
				(inv) => inv.invoiceId !== cancelledInvoiceId
			),
		}));
	};

	return (
		<div className="space-y-4 sm:space-y-5">
			{fetchError && (
				<DataFetchErrorState
					title="Kendala Sinkronisasi Data Donasi"
					description={
						typeof fetchError === "string"
							? fetchError
							: "Tidak dapat memuat data donasi terbaru. Silakan coba lagi."
					}
					onRetry={fetchDashboardData}
					compact
				/>
			)}

			{!fetchError && dashboardData.pendingInvoices?.length > 0 && (
				<DonorPendingInvoiceBanner
					invoices={dashboardData.pendingInvoices}
					onInvoiceCancelled={handleInvoiceCancelled}
				/>
			)}

			{!fetchError &&
				metrics.totalTransactions ===
					0 &&
				(!dashboardData.pendingInvoices || dashboardData.pendingInvoices.length === 0) && (
					<CampaignCTA
						ignoreAuthCheck={
							true
						}
						buttonHref="/program"
						className="mt-0"
					/>
				)}

			<div>
				<h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
					Dashboard
				</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
				<div className="lg:col-span-8 space-y-2.5">
					<DonorMetricCards
						metrics={
							metrics
						}
						lastDonation={
							lastDonation
						}
						isLoading={
							isLoading
						}
						hasActiveRoutine={
							hasActiveRoutine
						}
					/>

					<DonorMonthlyTrendChart
						initialMonthlyTrend={
							dashboardData.monthlyTrend
						}
						categoryDistribution={
							dashboardData.categoryDistribution
						}
						currentUser={
							currentUser
						}
					/>

					<DonorRecentReportsCard
						recentReports={
							dashboardData.recentReports
						}
						isLoading={
							isLoading
						}
					/>

					<DonorPrayersCard currentUser={currentUser} />
				</div>

				<div className="lg:col-span-4 space-y-2.5">
					<DonorCategoryDonutCard
						categoryDistribution={
							dashboardData.categoryDistribution
						}
						totalNominal={
							metrics.totalNominal
						}
					/>

					<DonorRecentTransactionsCard
						recentItems={
							dashboardData.recentItems
						}
						isLoading={
							isLoading
						}
					/>

					<DonorMonthlyTargetCard
						currentMonthAchieved={
							dashboardData.currentMonthAchieved
						}
						currentMonthTarget={
							dashboardData.currentMonthTarget
						}
					/>

					<div id="donor-routine-card" className="scroll-mt-20 rounded-xl transition-all duration-300">
						<DonorRoutineDonationsCard
							routineDonations={
								dashboardData.routineDonations
							}
							isLoading={
								isLoading
							}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
