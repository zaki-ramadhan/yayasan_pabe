const INSTITUTIONAL_PALETTES = [
  {
    id: "emerald-pine",
    baseFrom: "#064e3b",
    baseTo: "#022c22",
    splash1: "rgba(16, 185, 129, 0.45)",
    splash2: "rgba(20, 184, 166, 0.35)",
    splash3: "rgba(5, 150, 105, 0.25)",
  },
  {
    id: "midnight-navy",
    baseFrom: "#0f172a",
    baseTo: "#020617",
    splash1: "rgba(14, 165, 233, 0.42)",
    splash2: "rgba(59, 130, 246, 0.35)",
    splash3: "rgba(99, 102, 241, 0.25)",
  },
  {
    id: "charcoal-bronze",
    baseFrom: "#18181b",
    baseTo: "#09090b",
    splash1: "rgba(217, 119, 6, 0.42)",
    splash2: "rgba(180, 83, 9, 0.35)",
    splash3: "rgba(245, 158, 11, 0.20)",
  },
  {
    id: "imperial-indigo",
    baseFrom: "#1e1b4b",
    baseTo: "#090d16",
    splash1: "rgba(99, 102, 241, 0.45)",
    splash2: "rgba(129, 140, 248, 0.30)",
    splash3: "rgba(67, 56, 202, 0.25)",
  },
  {
    id: "dark-spruce",
    baseFrom: "#022c22",
    baseTo: "#052e16",
    splash1: "rgba(34, 197, 94, 0.40)",
    splash2: "rgba(132, 204, 22, 0.30)",
    splash3: "rgba(16, 185, 129, 0.22)",
  },
  {
    id: "deep-bordeaux",
    baseFrom: "#450a0a",
    baseTo: "#18181b",
    splash1: "rgba(220, 38, 38, 0.38)",
    splash2: "rgba(217, 119, 6, 0.30)",
    splash3: "rgba(153, 27, 27, 0.25)",
  },
  {
    id: "royal-teal",
    baseFrom: "#134e4a",
    baseTo: "#042f2e",
    splash1: "rgba(20, 184, 166, 0.42)",
    splash2: "rgba(6, 182, 212, 0.32)",
    splash3: "rgba(15, 118, 110, 0.25)",
  },
  {
    id: "dark-copper",
    baseFrom: "#292524",
    baseTo: "#0c0a09",
    splash1: "rgba(234, 88, 12, 0.38)",
    splash2: "rgba(202, 138, 4, 0.30)",
    splash3: "rgba(161, 98, 7, 0.25)",
  },
];

function hashString(str) {
  if (!str || typeof str !== "string") return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateBannerMesh(seed) {
  const hash = hashString(seed || "yayasan-pabe-generasi-sejahtera");
  const palette = INSTITUTIONAL_PALETTES[hash % INSTITUTIONAL_PALETTES.length];

  const baseX = 35 + (hash % 30);
  const baseY = 5 + ((hash >> 1) % 25);

  const x1 = 65 + (hash % 25);
  const y1 = 15 + ((hash >> 2) % 30);
  const size1 = 55 + ((hash >> 1) % 20);

  const x2 = 12 + ((hash >> 3) % 25);
  const y2 = 60 + ((hash >> 4) % 30);
  const size2 = 50 + ((hash >> 2) % 20);

  const x3 = 45 + ((hash >> 5) % 25);
  const y3 = 75 + ((hash >> 6) % 25);
  const size3 = 45 + ((hash >> 3) % 15);

  const backgroundStyle = {
    background: `radial-gradient(ellipse 135% 120% at ${baseX}% ${baseY}%, ${palette.baseFrom} 0%, ${palette.baseTo} 100%)`,
  };

  const splash1Style = {
    background: `radial-gradient(circle at ${x1}% ${y1}%, ${palette.splash1} 0%, transparent ${size1}%)`,
  };

  const splash2Style = {
    background: `radial-gradient(circle at ${x2}% ${y2}%, ${palette.splash2} 0%, transparent ${size2}%)`,
  };

  const splash3Style = {
    background: `radial-gradient(ellipse at ${x3}% ${y3}%, ${palette.splash3} 0%, transparent ${size3}%)`,
  };

  return {
    paletteId: palette.id,
    backgroundStyle,
    splash1Style,
    splash2Style,
    splash3Style,
  };
}
