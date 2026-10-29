import Image from "next/image";
import { ORG_PROFILE } from "@/data/orgProfile";

/**
 * Overlapping avatar stack showing active leadership and volunteers
 *
 * @param {object} props
 * @param {number} [props.volunteerCount=14] - Number of active volunteers
 * @param {Array} [props.leaders] - List of leadership members
 */
export function TeamAvatarStack({
  volunteerCount = 14,
  leaders = ORG_PROFILE.leadership || [],
}) {
  const leadershipCount = leaders.length;
  const totalTeam = leadershipCount + volunteerCount;

  return (
    <div className="flex items-center gap-2.5 pt-1 my-2.5">
      <div className="flex -space-x-2 overflow-hidden shrink-0">
        {leaders.map((leader, idx) => (
          <div
            key={leader.name || idx}
            className="relative w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden ring-2 ring-white bg-slate-200 shrink-0 shadow-2xs"
          >
            <Image
              src={leader.image}
              alt={leader.name}
              fill
              sizes="28px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
      <p className="text-xs sm:text-sm text-slate-700 font-medium">
        <strong className="text-slate-900 font-semibold">
          +{totalTeam} pengurus
        </strong>{" "}
        &amp; relawan aktif
      </p>
    </div>
  );
}
