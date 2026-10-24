const VOLUNTEER_PERKS = [
  {
    title: "Aksi Lapangan Terpadu",
    desc: "Terjun langsung ke titik bencana, pondok binaan, dan posko kesehatan dhuafa bersama tim lapangan profesional Yayasan Payung Berkah.",
  },
  {
    title: "Jejaring Positif & Kolaborasi",
    desc: "Bertemu dan berkolaborasi dengan ribuan aktivis filantropi, akademisi, dan profesional muda yang berdedikasi.",
  },
  {
    title: "Sertifikat & Rekognisi Resmi",
    desc: "Apresiasi legalitas relawan yayasan yang dapat dicantumkan sebagai portofolio pengabdian masyarakat.",
  },
];

export function VolunteerPerksList() {
  return (
    <div className="divide-y divide-slate-200">
      {VOLUNTEER_PERKS.map((perk, idx) => (
        <div key={idx} className="py-3.5 first:pt-0 last:pb-0 space-y-1">
          <h2 className="text-base font-semibold text-slate-950">{perk.title}</h2>
          <p className="text-sm text-slate-600 leading-relaxed font-normal">
            {perk.desc}
          </p>
        </div>
      ))}
    </div>
  );
}
