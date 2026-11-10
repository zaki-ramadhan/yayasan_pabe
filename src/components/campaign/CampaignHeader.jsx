import { MapPin } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { formatRupiah, isCampaignClosed } from "@/lib/formatters";
import { FundedAmountDisplay } from "@/components/campaign/FundedAmountDisplay";

export function CampaignHeader({ campaign, progress, daysLeft }) {
	const hasTarget = Boolean(
		campaign.targetAmount &&
		Number(
			campaign.targetAmount,
		) > 0,
	);
	const hasEndDate = Boolean(
		campaign.endDate &&
		daysLeft !== null,
	);
	const isClosed = isCampaignClosed(campaign);

	return (
		<div className="space-y-3">
			{/* Title */}
			<h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-950 leading-tight">
				{
					campaign.title
				}
			</h1>

			{/* Category & Location Metadata */}
			<div className="flex items-center gap-2.5 text-sm sm:text-base text-slate-800 flex-wrap pt-0.5">
				<span className="font-semibold text-slate-950">
					{
						campaign.categoryName
					}
				</span>
				{campaign.location && (
					<>
						<span
							className="text-slate-300 select-none"
							aria-hidden="true"
						>
							|
						</span>
						<span className="flex items-center gap-1.5 text-slate-700">
							<MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-slate-500 shrink-0" />
							<span>
								{
									campaign.location
								}
							</span>
						</span>
					</>
				)}
			</div>

			{/* Mobile-only Keterangan Dana Terkumpul Card */}
			<div className="lg:hidden p-4 bg-white rounded-xl border border-slate-300 space-y-3.5 shadow-xs">
				{hasTarget ? (
					<div className="space-y-2">
						<FundedAmountDisplay
							amount={campaign.collectedAmount}
							labelClassName="text-sm text-slate-700 block font-normal"
							amountClassName="text-2xl font-semibold text-slate-950 tracking-tight block"
						/>
						<div className="text-sm text-slate-700 flex justify-between items-center pt-0.5">
							<span>
								Target:{" "}
								<strong className="font-medium text-slate-900">
									{formatRupiah(campaign.targetAmount)}
								</strong>
							</span>
							<span className="font-semibold text-slate-900">
								{progress}%
							</span>
						</div>
						<Progress value={progress} className="h-2.5" />
					</div>
				) : (
					<div className="space-y-1">
						<FundedAmountDisplay
							amount={campaign.collectedAmount}
							labelClassName="text-sm text-slate-700 block font-normal"
							amountClassName="text-2xl font-semibold text-slate-950 tracking-tight block"
						/>
						<span className="text-sm text-emerald-700 font-medium block">
							Program Berkelanjutan
						</span>
					</div>
				)}

				{/* Metrics Row: Orang Baik & Sisa Hari */}
				<div className="grid grid-cols-2 divide-x divide-slate-200 pt-3 border-t border-slate-200 text-center">
					<div className="pr-3">
						<span className="block font-semibold text-slate-950 text-xl">
							{campaign.donorCount}
						</span>
						<span className="text-sm text-slate-600">
							Orang Baik
						</span>
					</div>
					<div className="pl-3">
						<span className="block font-semibold text-slate-950 text-xl">
							{isClosed
								? "Selesai"
								: hasEndDate && daysLeft > 0
								? daysLeft
								: hasEndDate && daysLeft <= 0
								? 0
								: "-"}
						</span>
						<span className="text-sm text-slate-600">
							{isClosed ? "Status" : "Hari Tersisa"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
