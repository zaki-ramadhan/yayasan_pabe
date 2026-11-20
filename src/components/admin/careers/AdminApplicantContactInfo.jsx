"use client";

import Image from "next/image";
import { WhatsAppIcon } from "@/components/icons/SocialIcons";
import { LetterIcon } from "@solar-icons/react/line-duotone/letter";
import { PhoneIcon } from "@solar-icons/react/line-duotone/phone";
import { ArrowRightUpIcon } from "@solar-icons/react/linear/arrow-right-up";
import { getFileIconAsset } from "@/lib/fileIconHelper";

/**
 * Sub-komponen kontak & berkas CV pelamar karier (Email, WhatsApp, Unduh CV).
 */
export function AdminApplicantContactInfo({ email, phone, waUrl, resumeUrl }) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
      <span className="flex items-center gap-1.5">
        <LetterIcon className="w-4 h-4 text-slate-400" />
        <span className="font-normal text-slate-700">{email || "-"}</span>
      </span>

      <span className="flex items-center gap-1.5">
        {waUrl ? (
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-normal text-slate-700 hover:text-emerald-700 hover:underline inline-flex items-center gap-1.5 group"
            title="Hubungi via WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 text-emerald-600 group-hover:scale-105 transition-transform shrink-0" />
            <span>{phone}</span>
          </a>
        ) : (
          <>
            <PhoneIcon className="w-4 h-4 text-slate-400" />
            <span className="font-normal text-slate-700">{phone || "-"}</span>
          </>
        )}
      </span>

      {resumeUrl && (
        <span className="flex items-center gap-1.5">
          <Image
            src={getFileIconAsset(resumeUrl, "pdf")}
            alt="Berkas CV"
            width={18}
            height={18}
            className="w-4.5 h-4.5 object-contain shrink-0"
          />
          <a
            href={resumeUrl}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline flex items-center gap-0.5 font-normal"
          >
            <span>Unduh Resume/CV</span>
            <ArrowRightUpIcon className="w-3.5 h-3.5 ml-0.5" />
          </a>
        </span>
      )}
    </div>
  );
}

