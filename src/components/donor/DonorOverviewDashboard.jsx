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
	});
	const [isLoading, setIsLoading] = useState(true);
	const [fetchError, setFetchError] = useState(null);

	// Initial fetch data dashboard menyeluruh untuk pengguna saat ini
	const fetchDashboardData = useCallback(async () => {
		if (
			!currentUser?.email &&
			!currentUser?.name
		) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
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
				setFetchError(json.message || "Gagal memuat data akun.");
			}
		} catch (err) {
			console.error(
				"Gagal memuat data dashboard:",
				err,
			);
			setFetchError(err.message || "Koneksi terputus saat mengambil data donasi.");
		} finally {
			setIsLoading(
				false,
			);
		}
	}, [currentUser?.email, currentUser?.name]);

	useEffect(() => {
		fetchDashboardData();
	}, [fetchDashboardData]);

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

	return (
		<div className="space-y-4 sm:space-y-5">
			{/* Banner Error Sinkronisasi: Mencegah salah sangka data kosong */}
			{fetchError && (
				<DataFetchErrorState
					title="Gangguan Koneksi Riwayat Donasi"
					description="Tidak dapat menyinkronkan data donasi terbaru Anda ke server. Silakan periksa jaringan dan coba lagi."
					onRetry={fetchDashboardData}
					compact
				/>
			)}

			{/* Banner Promosi Cepat: HANYA muncul jika belum pernah berdonasi dan tidak error */}
			{!fetchError &&
				metrics.totalTransactions ===
					0 && (
					<CampaignCTA
						ignoreAuthCheck={
							true
						}
						buttonHref="/program"
						className="mt-0"
					/>
				)}

			{/* Heading Utama */}
			<div>
				<h1 className="text-lg sm:text-xl font-medium tracking-tight text-slate-950">
					Dashboard
				</h1>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5">
				{/* ======================================================== */}
				{/* KOLOM KIRI & TENGAH (8 KANVAS: METRIK + GRAFIK + LAPORAN) */}
				{/* ======================================================== */}
				<div className="lg:col-span-8 space-y-2.5">
					{/* 1. Baris Kartu Metrik Utama & Quick Actions */}
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
					/>

					{/* 2. Grafik Riwayat Donasi Bulanan (Terisolasi per tahun) */}
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

					{/* 3. Kabar Penyaluran Terbaru */}
					<DonorRecentReportsCard
						recentReports={
							dashboardData.recentReports
						}
						isLoading={
							isLoading
						}
					/>

					{/* 4. Doa & Harapan Saya */}
					<DonorPrayersCard currentUser={currentUser} />
				</div>

				{/* ======================================================== */}
				{/* KOLOM KANAN (4 KANVAS: KATEGORI + TRANSAKSI + TARGET + RUTIN) */}
				{/* ======================================================== */}
				<div className="lg:col-span-4 space-y-2.5">
					{/* 1. Kategori Donasi (Semi-circle Gauge Donut) */}
					<DonorCategoryDonutCard
						categoryDistribution={
							dashboardData.categoryDistribution
						}
						totalNominal={
							metrics.totalNominal
						}
					/>

					{/* 2. Transaksi Terakhir */}
					<DonorRecentTransactionsCard
						recentItems={
							dashboardData.recentItems
						}
						isLoading={
							isLoading
						}
					/>

					{/* 3. Target Kebaikan Bulanan */}
					<DonorMonthlyTargetCard
						currentMonthAchieved={
							dashboardData.currentMonthAchieved
						}
						currentMonthTarget={
							dashboardData.currentMonthTarget
						}
					/>

					{/* 4. Donasi Rutin Tersimpan */}
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
	);
}
