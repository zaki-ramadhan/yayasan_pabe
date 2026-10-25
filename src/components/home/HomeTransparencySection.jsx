import { SectionHeader } from "@/components/shared/SectionHeader";
import { TransparencyTrendChart } from "./TransparencyTrendChart";
import { TransparencySummaryCard } from "./TransparencySummaryCard";
import { cn } from "@/lib/utils";

/**
 * Transparency section featuring 12-month distribution chart on the left and summary card on the right
 * @param {object} props
 * @param {object} props.metrics
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {string} [props.className]
 */
export function HomeTransparencySection({
  metrics,
  title = "Laporan Penyaluran & Audit Keuangan",
  subtitle = "Setiap rupiah donasi tercatat transparan dan diaudit berkala, memastikan amanah Anda tersalurkan tepat sasaran.",
  className = "",
}) {
  return (
    <section className={cn("relative overflow-hidden", className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <SectionHeader
          title={title}
          subtitle={subtitle}
          align="center"
        />

        {/* Layout Sebaris: Chart di Kiri (8 col) & Card Ringkasan di Kanan (4 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
          <div className="lg:col-span-8 flex flex-col justify-center">
            <TransparencyTrendChart data={metrics?.monthlyTrend} />
          </div>
          <div className="lg:col-span-4">
            <TransparencySummaryCard metrics={metrics} />
          </div>
        </div>
      </div>
    </section>
  );
}
