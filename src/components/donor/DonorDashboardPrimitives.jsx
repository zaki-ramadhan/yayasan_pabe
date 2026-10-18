"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wrapper kartu section standar pada dashboard donatur
 */
export function DonorCard({
	title,
	actionText,
	actionHref,
	rightElement,
	children,
	className = "",
	headerClassName = "",
}) {
	return (
		<div
			className={cn(
				"rounded-md border border-slate-200/90 bg-sidebar p-4.5 sm:p-5 space-y-3",
				className,
			)}
		>
			{(title ||
				actionText ||
				rightElement) && (
				<div
					className={cn(
						"flex items-center justify-between",
						headerClassName,
					)}
				>
					{title && (
						<h2 className="text-base font-medium text-slate-950">
							{
								title
							}
						</h2>
					)}
					{
						rightElement
					}
					{actionText &&
						actionHref &&
						!rightElement && (
							<Link
								href={
									actionHref
								}
								className="text-sm font-medium text-primary hover:underline"
							>
								{
									actionText
								}
							</Link>
						)}
				</div>
			)}
			{
				children
			}
		</div>
	);
}

/**
 * Display format rupiah dengan prefix Rp kecil proporsional
 */
export function DonorAmountDisplay({
	amount = 0,
	prefixClassName = "text-xs sm:text-sm font-medium text-slate-950",
	valueClassName = "text-2xl font-medium text-slate-950",
	className = "tracking-tight text-slate-950 flex items-baseline gap-1 mt-1",
}) {
	return (
		<p className={className}>
			<span
				className={
					prefixClassName
				}
			>
				Rp
			</span>
			<span
				className={
					valueClassName
				}
			>
				{Number(
					amount ||
						0,
				).toLocaleString(
					"id-ID",
				)}
			</span>
		</p>
	);
}

/**
 * Kartu metrik tunggal ringkas
 */
export function DonorStatCard({
	title,
	value,
	amount,
	isCurrency = false,
	className = "",
	children,
}) {
	return (
		<div
			className={cn(
				"rounded-md border border-slate-200/90 bg-sidebar p-4 sm:p-5",
				className,
			)}
		>
			<p className="text-sm font-medium text-slate-500">
				{
					title
				}
			</p>
			{isCurrency ? (
				<DonorAmountDisplay
					amount={
						amount
					}
				/>
			) : (
				<p className="text-2xl font-medium text-slate-950 mt-1 tracking-tight">
					{
						value
					}
				</p>
			)}
			{
				children
			}
		</div>
	);
}

/**
 * Row card item standar (transaksi / donasi rutin)
 */
export function DonorListItem({ children, className = "" }) {
	return (
		<div
			className={cn(
				"p-3 rounded-md border border-slate-300 hover:border-slate-400 bg-white transition-colors flex items-center justify-between gap-2.5",
				className,
			)}
		>
			{
				children
			}
		</div>
	);
}

/**
 * Skeleton loader list berulang
 */
export function DonorListSkeleton({ count = 2, height = "h-12" }) {
	return (
		<div className="space-y-2.5">
			{Array.from(
				{
					length: count,
				},
			).map(
				(
					_,
					idx,
				) => (
					<div
						key={
							idx
						}
						className={cn(
							"bg-white rounded-md border border-slate-300/80 animate-pulse",
							height,
						)}
					/>
				),
			)}
		</div>
	);
}

/**
 * Teks pesan kosong standar
 */
export function DonorEmptyText({ message = "Belum ada data", py = "py-6" }) {
	return (
		<p
			className={cn(
				"text-center text-sm font-medium text-slate-500",
				py,
			)}
		>
			{
				message
			}
		</p>
	);
}
