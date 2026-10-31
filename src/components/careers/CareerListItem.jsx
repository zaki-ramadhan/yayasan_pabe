"use client";

import { MapPin, Briefcase, Laptop } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { CareerMetaItem } from "./CareerMetaItem";
import { CareerNewBadge } from "./CareerNewBadge";
import { CareerCardFooter } from "./CareerCardFooter";
import { isPostedToday, formatWorkplace } from "@/data/careers";

/**
 * Molecule component: Master job listing card
 * Directly shows job title and department without an icon,
 * dynamically renders a clean 'Baru' badge chip without dots for jobs posted today,
 * and uses readable text-slate-600 matching the description text.
 * @param {object} props
 * @param {object} props.job
 * @param {boolean} props.isSelected
 * @param {Function} props.onSelect
 */
export function CareerListItem({
  job,
  isSelected = false,
  onSelect,
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
          {isNew && <CareerNewBadge />}
        </div>
      </div>

      {/* Metadata Row: Location, Type & Workplace at text-xs with text-slate-600 */}
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

      {/* Bottom Row: Applicant count and posted date at text-xs text-slate-600 separated by dashed line */}
      <CareerCardFooter
        applicantCount={job.applicantCount}
        postedAt={job.postedAt}
      />
    </Card>
  );
}
