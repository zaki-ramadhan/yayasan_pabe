import { ORG_PROFILE } from "@/data/orgProfile";
import { BankAccountItem } from "./BankAccountItem";
import { BankCardShowcase } from "./BankCardShowcase";

export function AboutBankAccounts({ orgSettings = null }) {
  const accounts =
    Array.isArray(orgSettings?.officialBankAccounts) &&
    orgSettings.officialBankAccounts.length > 0
      ? orgSettings.officialBankAccounts
      : ORG_PROFILE.officialBankAccounts;

  return (
    <section id="rekening-resmi" className="p-4 sm:p-5 space-y-4 overflow-hidden scroll-mt-20">
      <div>
        <h2 className="text-lg sm:text-xl font-medium text-slate-950">
          Nomor Rekening Donasi
        </h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Dana Yayasan Payung Berkah bersumber dari para donatur.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
        {/* Left: Reusable Bank Card 3D Showcase */}
        <BankCardShowcase />

        {/* Right: Clean Plain Text Bank Account List (Right-Aligned & Matched Text Size) */}
        <div className="md:col-span-6 space-y-4 md:text-right md:mr-2">
          {accounts.map((acc, idx) => (
            <BankAccountItem
              key={acc.bank || idx}
              account={acc}
              isFirst={idx === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
