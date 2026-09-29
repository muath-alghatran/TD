/**
 * بيانات مناطق المخطط وقطعها — منقولة حرفياً من `ZONES`/`LAYERS` في
 * docs/prototype-parts.html (السطور 629-670). هذا هو "الحقيقة النهائية"
 * حسب كل مستند حاكم — لا docs/data/zone_map.csv، وهو عيّنة جزئية موثّقة
 * (4 مناطق من أصل 8، بلا أسعار/موردين) منذ المرحلة 2.
 */
export interface CatalogPart {
  oem: string;
  n: string;
  /** نوع الشكل في src/lib/part-glyphs.ts */
  g: string;
  tier?: string;
  price?: number;
  stock?: number;
  rel?: number;
  hrs?: number;
  war?: number;
  /** false = غير مغطاة في الكتالوج بعد */
  avail?: false;
}

export interface CatalogZone {
  id: string;
  ref: string;
  layer: string;
  name: string;
  x: number;
  y: number;
  total: number;
  parts: CatalogPart[];
}

export const ZONES: CatalogZone[] = [
  {
    id: "Z1",
    ref: "B2",
    layer: "ميكانيكا",
    name: "المحرك والتبريد",
    x: 150,
    y: 232,
    total: 34,
    parts: [
      { oem: "16400-0P260", n: "ردياتير", g: "rad", tier: "بديل معتمد", price: 728.64, stock: 2, rel: 0.88, hrs: 2.5, war: 12 },
      { oem: "90915-YZZD4", n: "فلتر زيت", g: "filter", tier: "وكالة", price: 40.48, stock: 40, rel: 0.95, hrs: 0.5, war: 6 },
      { oem: "17801-0H080", n: "فلتر هواء", g: "filter", tier: "بديل معتمد", price: 78.2, stock: 0, rel: 0.88, hrs: 0.3, war: 6 },
      { oem: "16600-0P010", n: "مروحة تبريد", g: "fan", avail: false },
      { oem: "90916-A2200", n: "سير مكائن", g: "belt", avail: false },
    ],
  },
  {
    id: "Z2",
    ref: "A3",
    layer: "بدي",
    name: "البدي الأمامي والصدام",
    x: 84,
    y: 270,
    total: 22,
    parts: [
      { oem: "53101-06923", n: "صدام أمامي", g: "bumper", tier: "بديل معتمد", price: 912.13, stock: 0, rel: 0.75, hrs: 3.0, war: 3 },
      { oem: "81150-06D40", n: "شمعة أمامية يسار", g: "lamp", tier: "بديل معتمد", price: 1150.0, stock: 1, rel: 0.75, hrs: 1.0, war: 6 },
      { oem: "53111-06430", n: "شبك أمامي", g: "grille", avail: false },
      { oem: "53301-06180", n: "كبوت", g: "panel", avail: false },
    ],
  },
  {
    id: "Z3",
    ref: "C4",
    layer: "عضلات السيارة",
    name: "الفرامل والعفشة الأمامية",
    x: 240,
    y: 300,
    total: 28,
    parts: [
      { oem: "04465-33471", n: "فحمات فرامل أمامية", g: "pad", tier: "وكالة", price: 326.03, stock: 6, rel: 0.95, hrs: 1.0, war: 12 },
      { oem: "AD-0451", n: "فحمات فرامل أمامية", g: "pad", tier: "بديل معتمد", price: 200.1, stock: 10, rel: 0.88, hrs: 1.0, war: 6 },
      { oem: "48510-0K120", n: "مساعد أمامي", g: "shock", tier: "وكالة", price: 527.85, stock: 0, rel: 0.95, hrs: 1.5, war: 12 },
      { oem: "43512-06180", n: "دسك فرامل أمامي", g: "disc", tier: "بديل معتمد", price: 312.0, stock: 0, rel: 0.75, hrs: 1.2, war: 6 },
      { oem: "48815-06200", n: "جلدة مثبت", g: "bush", avail: false },
    ],
  },
  {
    id: "Z4",
    ref: "C2",
    layer: "كهرباء",
    name: "الكهرباء والبطارية",
    x: 302,
    y: 200,
    total: 19,
    parts: [
      { oem: "AGM-70AH", n: "بطارية 70 أمبير", g: "batt", tier: "بديل معتمد", price: 426.08, stock: 8, rel: 0.92, hrs: 0.4, war: 24 },
      { oem: "28100-0T030", n: "دينمو تشغيل (سلف)", g: "motor", tier: "تجاري", price: 627.9, stock: 0, rel: 0.88, hrs: 2.0, war: 3 },
      { oem: "27060-0V090", n: "دينمو شحن", g: "motor", tier: "وكالة", price: 1240.0, stock: 0, rel: 0.62, hrs: 2.2, war: 12 },
      { oem: "90919-01253", n: "بواجي إشعال", g: "plug", avail: false },
    ],
  },
  {
    id: "Z5",
    ref: "E1",
    layer: "كهرباء",
    name: "المقصورة والتكييف",
    x: 480,
    y: 140,
    total: 26,
    parts: [
      { oem: "87139-YZZ20", n: "فلتر مكيف", g: "filter", tier: "وكالة", price: 69.0, stock: 25, rel: 0.95, hrs: 0.3, war: 6 },
      { oem: "88320-06710", n: "كمبروسر مكيف", g: "motor", tier: "بديل معتمد", price: 1890.0, stock: 0, rel: 0.62, hrs: 3.5, war: 12 },
      { oem: "88650-06730", n: "حساس حرارة المقصورة", g: "plug", avail: false },
    ],
  },
  {
    id: "Z6",
    ref: "E4",
    layer: "ميكانيكا",
    name: "العادم والوقود",
    x: 530,
    y: 286,
    total: 17,
    parts: [
      { oem: "77024-06310", n: "طرمبة بنزين", g: "pump", tier: "وكالة", price: 980.0, stock: 0, rel: 0.75, hrs: 2.0, war: 12 },
      { oem: "17430-0P330", n: "شكمان أوسط", g: "pipe", tier: "تجاري", price: 410.0, stock: 0, rel: 0.58, hrs: 1.8, war: 3 },
      { oem: "77740-06170", n: "فلتر بخار الوقود", g: "filter", avail: false },
    ],
  },
  {
    id: "Z7",
    ref: "G4",
    layer: "عضلات السيارة",
    name: "الفرامل والعفشة الخلفية",
    x: 664,
    y: 300,
    total: 24,
    parts: [
      { oem: "04466-33210", n: "فحمات فرامل خلفية", g: "pad", tier: "وكالة", price: 289.0, stock: 0, rel: 0.95, hrs: 1.0, war: 12 },
      { oem: "48530-0K180", n: "مساعد خلفي", g: "shock", tier: "بديل معتمد", price: 445.0, stock: 0, rel: 0.58, hrs: 1.4, war: 6 },
      { oem: "42431-06180", n: "دسك فرامل خلفي", g: "disc", avail: false },
    ],
  },
  {
    id: "Z8",
    ref: "H3",
    layer: "بدي",
    name: "البدي الخلفي والشنطة",
    x: 822,
    y: 238,
    total: 20,
    parts: [
      { oem: "52159-06430", n: "صدام خلفي", g: "bumper", tier: "بديل معتمد", price: 845.0, stock: 0, rel: 0.75, hrs: 2.5, war: 3 },
      { oem: "81550-06710", n: "شمعة خلفية يمين", g: "lamp", tier: "وكالة", price: 690.0, stock: 0, rel: 0.58, hrs: 0.8, war: 12 },
      { oem: "64401-06400", n: "غطاء الشنطة", g: "panel", avail: false },
    ],
  },
];

export const LAYERS = ["الكل", "بدي", "ميكانيكا", "كهرباء", "عضلات السيارة"];
