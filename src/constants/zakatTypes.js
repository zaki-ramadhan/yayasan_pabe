export const ZAKAT_TYPES = [
  {
    id: "ZAKAT_PENGHASILAN",
    alias: ["ZAKAT_PROFESI"],
    label: "Zakat Profesi",
    shortLabel: "Profesi",
    description: "Zakat profesi/gaji atas penghasilan rutin bulanan dengan nisab 85 gr emas per tahun, ditunaikan saat menerima.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaata maali fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat profesiku, fardhu karena Allah Ta'ala.",
    },
  },
  {
    id: "ZAKAT_EMAS",
    label: "Zakat Emas",
    shortLabel: "Emas",
    description: "Zakat kepemilikan simpanan emas yang telah mencapai nisab 85 gram dan genap haul 1 tahun.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ ذَهَبِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaata dzahabii fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat emasku, fardhu karena Allah Ta'ala.",
    },
  },
  {
    id: "ZAKAT_PERAK",
    label: "Zakat Perak",
    shortLabel: "Perak",
    description: "Zakat kepemilikan simpanan perak yang telah mencapai nisab 595 gram dan genap haul 1 tahun.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ فِضَّتِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaata fidhdhatii fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat perakku, fardhu karena Allah Ta'ala.",
    },
  },
  {
    id: "ZAKAT_PERDAGANGAN",
    label: "Zakat Perdagangan",
    shortLabel: "Perdagangan",
    description: "Zakat komoditas atau perputaran stok barang dagangan yang diniatkan untuk dijual kembali.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ تِجَارَتِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaata tijaaratii fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat perdaganganku, fardhu karena Allah Ta'ala.",
    },
  },
  {
    id: "ZAKAT_PERUSAHAAN",
    label: "Zakat Perusahaan",
    shortLabel: "Perusahaan",
    description: "Zakat badan usaha atau entitas bisnis yang beroperasi dan memenuhi nisab perdagangan.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ هَذِهِ الشَّرِكَةِ فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaata haadzihisy syarikati fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat perusahaan ini, fardhu karena Allah Ta'ala.",
    },
  },
  {
    id: "ZAKAT_MAAL",
    alias: ["ZAKAT_TABUNGAN"],
    label: "Zakat Tabungan",
    shortLabel: "Tabungan",
    description: "Zakat atas saldo tabungan dan deposito mengendap dengan nisab setara 85 gr emas setelah haul 1 tahun.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaata maali fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat tabunganku, fardhu karena Allah Ta'ala.",
    },
  },
  {
    id: "ZAKAT_PERTANIAN",
    label: "Zakat Pertanian",
    shortLabel: "Pertanian",
    description: "Zakat hasil panen pertanian dengan nisab 522 kg beras atau 653 kg gabah, ditunaikan saat panen.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ زَرْعِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaata zar'ii fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat hasil tanamanku, fardhu karena Allah Ta'ala.",
    },
  },
  {
    id: "ZAKAT_FITRAH",
    label: "Zakat Fitrah",
    shortLabel: "Fitrah",
    description: "Zakat penyuci jiwa yang ditunaikan menjelang Idul Fitri bagi setiap jiwa muslim.",
    niat: {
      arab: "نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِي فَرْضًا لِلَّهِ تَعَالَى",
      latin: "Nawaitu an ukhrija zakaatal fithri 'an nafsii fardhan lillaahi ta'aala",
      arti: "Aku niat mengeluarkan zakat fitrah untuk diriku sendiri, fardhu karena Allah Ta'ala.",
    },
  },
];

export const ZAKAT_AMIL_PRAYER = {
  arab: "آجَرَكَ اللَّهُ فِيمَا أَعْطَيْتَ، وَبَارَكَ فِيمَا أَبْقَيْتَ، وَجَعَلَهُ لَكَ طَهُورًا",
  latin: "Aajarokallahu fiimaa a'thoita, wa baaraka fiimaa abqoita, wa ja'alahu laka thahuuraa",
  arti: "Semoga Allah memberikan pahala atas apa yang engkau berikan, memberkahi apa yang engkau sisakan, dan menjadikannya pembersih bagimu.",
};

export const ZAKAT_NOMINAL_PRESETS = [
  100000,
  250000,
  500000,
  1000000,
  2500000,
  5000000,
];

/**
 * Resolves zakat type label by type ID or legacy alias.
 * @param {string} typeId
 * @returns {string}
 */
export function getZakatTypeLabel(typeId) {
  if (!typeId) return "Zakat";
  const found = ZAKAT_TYPES.find(
    (t) => t.id === typeId || t.alias?.includes(typeId)
  );
  return found?.label || "Zakat";
}
