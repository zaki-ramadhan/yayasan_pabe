"use client";

import { MapPointIcon as MapPin } from "@solar-icons/react/line-duotone/map-point";
import { CaseRoundIcon as Briefcase } from "@solar-icons/react/line-duotone/case-round";
import { LaptopIcon as Laptop } from "@solar-icons/react/line-duotone/laptop";
import { Card } from "@/components/ui/Card";
import { CareerMetaItem } from "./CareerMetaItem";
import { CareerNewBadge } from "./CareerNewBadge";
import { CareerAppliedBadge } from "./CareerAppliedBadge";
import { DonorCareerTimeline } from "@/components/donor/career/DonorCareerTimeline";
import { CareerCardFooter } from "./CareerCardFooter";
import { isPostedToday, formatWorkplace } from "@/data/careers";

/**
 * Molecule component: Master job listing card
 * Directly shows job title and department without an icon,
 * dynamically renders a clean 'Baru' badge chip without dots for jobs posted today,
 * displays a vertical stepper for applied applications,
 * and uses readable text-slate-600 matching the description text.
 * @param {object} props
 * @param {object} props.job
 * @param {boolean} props.isSelected
 * @param {Function} props.onSelect
 * @param {boolean} [props.isApplied]
 * @param {object} [props.application]
 */
export function CareerListItem({
  job,
  isSelected = false,
  onSelect,
  isApplied = false,
  application = null,
}) {
  const isNew = isPostedToday(job.publishedDate);

  return (
    <Card
      onClick={() => onSelect(job.id)}
      className={`p-4 sm:p-4.5 shadow-none rounded-lg transition-all cursor-pointer text-left ${
        isSelected
          ? "border-primary bg-blue-50/40 shadow-xs ring-1 ring-primary/25"
          : "border-slate-200 bg-white hover:bg-slate-50/50"
      }`}
    >
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug">
            {job.title}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
            {isApplied && <CareerAppliedBadge />}
            {isNew && !isApplied && <CareerNewBadge />}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 mt-2">
        <CareerMetaItem icon={MapPin} text={job.location} size="xs" />
        <CareerMetaItem icon={Briefcase} text={job.type} size="xs" />
        {job.workplace && (
          <CareerMetaItem icon={Laptop} text={formatWorkplace(job.workplace)} size="xs" />
        )}
      </div>

      {job.overview && (
        <p className="text-sm font-normal text-slate-600 line-clamp-2 mt-2 leading-relaxed">
          {job.overview}
        </p>
      )}

      {isApplied && isSelected && (
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <DonorCareerTimeline status={application?.status || "PENDING"} size="sm" />
        </div>
      )}

      <CareerCardFooter
        applicantCount={job.applicantCount}
        postedAt={job.postedAt}
        quota={job.quota}
      />
    </Card>
  );
}
