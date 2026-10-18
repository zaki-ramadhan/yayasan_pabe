import Image from "next/image";
import { ORG_PROFILE } from "@/data/orgProfile";
import { BankAccountItem } from "./BankAccountItem";

export function AboutBankAccounts() {
  return (
    <section className="p-4 sm:p-5 space-y-4 overflow-hidden">
      <h2 className="text-lg sm:text-xl font-semibold text-slate-950">
        Rekening Resmi Yayasan
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 sm:gap-6 items-center">
        {/* Left: Card Asset (Enlarged & Rotated 20deg Left) */}
        <div className="hidden md:flex md:col-span-5 relative w-full h-72 sm:h-80 md:h-96 items-center justify-center p-2">
          <Image
            src="/img/bank_account_cards.png"
            alt="Kartu Rekening Resmi Yayasan PABE BSI, BCA, Mandiri"
            fill
            className="object-contain drop-shadow-xl md:rotate-[-20deg] md:scale-130 md:translate-x-15 md:translate-y-5 transition-transform"
            sizes="(max-width: 768px) 100vw, 40vw"
            priority
          />
        </div>

        {/* Right: Clean Plain Text Bank Account List (Right-Aligned & Matched Text Size) */}
        <div className="md:col-span-7 space-y-4 md:text-right md:mr-5">
          {ORG_PROFILE.officialBankAccounts.map((acc, idx) => (
            <BankAccountItem
              key={acc.bank}
              account={acc}
              isFirst={idx === 0}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

