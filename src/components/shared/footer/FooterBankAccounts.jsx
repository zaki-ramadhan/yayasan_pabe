import { ORG_PROFILE } from "@/data/orgProfile";

/**
 * Official bank accounts list for footer
 *
 * @param {object} props
 * @param {Array} [props.accounts] - List of bank account objects
 */
export function FooterBankAccounts({ accounts = ORG_PROFILE.officialBankAccounts }) {
  if (!accounts || accounts.length === 0) return null;

  return (
    <div className="space-y-3.5">
      <h4 className="text-sm font-semibold text-white tracking-wider uppercase">
        Rekening Resmi
      </h4>
      <div className="space-y-3">
        {accounts.map((acc) => (
          <div key={acc.bank} className="space-y-0.5 border-b border-slate-800/80 pb-2.5 last:border-none">
            <div className="text-sm font-medium text-slate-200">{acc.bank}</div>
            <div className="font-semibold text-white text-base font-mono tracking-wider">{acc.accountNumber}</div>
            <div className="text-sm text-slate-300">a.n. {acc.accountName}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
