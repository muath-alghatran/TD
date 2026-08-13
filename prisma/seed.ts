/**
 * سكربت البذر — يقرأ بيانات تجريبية من docs/data/*.csv (المصدر الذي حدّده
 * TrustDrive_Transfer_Windows.md للبذر) ويعبّئ الجداول المرجعية.
 *
 * لا يُدخل بيانات Fitment: ملفات docs/data/*.csv الحالية لا تحمل عمود
 * generationCode بعد (لم تُجهَّز في "المرحلة 0 · التحضير" الحقيقية —
 * راجع docs/build-plan.md). إدخال أرقام أجيال مخترعة هنا خطر — Fitment
 * أخطر جدول في النظام (docs/brief.md §5) — لذا يبقى فارغاً حتى تتوفر بيانات حقيقية.
 *
 * لا يُدخل User/Vehicle/Order: هذه بيانات تُنشأ من تدفق التطبيق الفعلي
 * (المرحلتان 3 و5)، لا بيانات مرجعية تُبذر مسبقاً.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { parse } from "csv-parse/sync";
import { PrismaClient } from "../src/generated/prisma/client";

// Prisma 7 يتطلب محوّل تشغيل (driver adapter) صراحة بدل قراءة رابط الاتصال ضمنياً.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const dataDir = path.join(__dirname, "..", "docs", "data");

function readCsv<T extends Record<string, string>>(filename: string): T[] {
  const raw = readFileSync(path.join(dataDir, filename), "utf-8");
  return parse(raw, { columns: true, skip_empty_lines: true, bom: true }) as T[];
}

async function main() {
  console.log("حذف بيانات البذر السابقة…");
  await prisma.demandGap.deleteMany();
  await prisma.zonePart.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.fitment.deleteMany();
  await prisma.part.deleteMany();
  await prisma.zone.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.city.deleteMany();
  await prisma.setting.deleteMany();

  console.log("Setting…");
  const settingsRows = readCsv<{ المتغير: string; القيمة: string; "الوصف / الاستخدام": string }>(
    "settings.csv",
  );
  for (const row of settingsRows) {
    await prisma.setting.create({
      data: {
        key: row["المتغير"],
        value: row["القيمة"],
        description: row["الوصف / الاستخدام"] || null,
      },
    });
  }

  console.log("Supplier…");
  const supplierRows = readCsv<{
    "كود المورد": string;
    "اسم المورد / المندوب": string;
    المنطقة: string;
    "نسبة الالتزام %": string;
    "وقت التوريد (ساعة)": string;
  }>("suppliers.csv");
  const supplierIdByCode = new Map<string, string>();
  for (const row of supplierRows) {
    const supplier = await prisma.supplier.create({
      data: {
        code: row["كود المورد"],
        name: row["اسم المورد / المندوب"],
        area: row["المنطقة"] || null,
        reliabilityRate: row["نسبة الالتزام %"],
        leadTimeHours: row["وقت التوريد (ساعة)"],
      },
    });
    supplierIdByCode.set(supplier.code, supplier.id);
  }

  console.log("City…");
  const cityRows = readCsv<{
    المدينة: string;
    المنطقة: string;
    "أيام الشحن (أدنى)": string;
    "أيام الشحن (أعلى)": string;
    "تكلفة الشحن": string;
    "معامل الثقة": string;
  }>("cities_sla.csv");
  const cityIdByName = new Map<string, string>();
  for (const row of cityRows) {
    const city = await prisma.city.create({
      data: {
        name: row["المدينة"],
        region: row["المنطقة"] || null,
        shipDaysMin: Math.round(Number(row["أيام الشحن (أدنى)"])),
        shipDaysMax: Math.round(Number(row["أيام الشحن (أعلى)"])),
        shipCost: row["تكلفة الشحن"],
        trustFactor: row["معامل الثقة"],
      },
    });
    cityIdByName.set(city.name, city.id);
  }

  console.log("Zone…");
  const zoneRows = readCsv<{
    "معرّف المنطقة": string;
    "اسم المنطقة (عربي)": string;
    "الطبقة/التصنيف": string;
    "إحداثي X": string;
    "إحداثي Y": string;
    "رقم الاستدعاء": string;
    "كود القطعة (SKU)": string;
  }>("zone_map.csv");
  const seenZoneIds = new Set<string>();
  for (const row of zoneRows) {
    const zoneCsvId = row["معرّف المنطقة"];
    if (seenZoneIds.has(zoneCsvId)) continue;
    seenZoneIds.add(zoneCsvId);
    await prisma.zone.create({
      data: {
        id: zoneCsvId,
        nameAr: row["اسم المنطقة (عربي)"],
        layer: row["الطبقة/التصنيف"],
        svgX: Math.round(Number(row["إحداثي X"])),
        svgY: Math.round(Number(row["إحداثي Y"])),
      },
    });
  }
  /** SKU → { zoneId, calloutNumber } من zone_map.csv */
  const zoneAssignmentBySku = new Map<string, { zoneId: string; calloutNumber: number }>();
  for (const row of zoneRows) {
    zoneAssignmentBySku.set(row["كود القطعة (SKU)"], {
      zoneId: row["معرّف المنطقة"],
      calloutNumber: Math.round(Number(row["رقم الاستدعاء"])),
    });
  }

  console.log("Part…");
  const partRows = readCsv<{
    "كود القطعة (SKU)": string;
    "رقم القطعة الأصلي (OEM)": string;
    "اسم القطعة (عربي)": string;
    "Part Name (EN)": string;
    الفئة: string;
    "مستوى الجودة": string;
    "الضمان (شهر)": string;
    الحالة: string;
  }>("parts_catalog.csv");
  const laborRows = readCsv<{ "كود القطعة (SKU)": string; "ساعات العمل المعيارية": string }>(
    "labor_rates.csv",
  );
  const laborHoursBySku = new Map(laborRows.map((r) => [r["كود القطعة (SKU)"], r["ساعات العمل المعيارية"]]));

  const partIdBySku = new Map<string, string>();
  for (const row of partRows) {
    const sku = row["كود القطعة (SKU)"];
    const zoneAssignment = zoneAssignmentBySku.get(sku);
    const part = await prisma.part.create({
      data: {
        sku,
        oemNumber: row["رقم القطعة الأصلي (OEM)"],
        nameAr: row["اسم القطعة (عربي)"],
        nameEn: row["Part Name (EN)"] || null,
        category: row["الفئة"],
        qualityTier: row["مستوى الجودة"],
        warrantyMonths: Math.round(Number(row["الضمان (شهر)"])),
        laborHours: laborHoursBySku.get(sku) ?? "0",
        isActive: row["الحالة"] === "نشط",
        zoneId: zoneAssignment?.zoneId ?? null,
      },
    });
    partIdBySku.set(sku, part.id);

    if (zoneAssignment) {
      await prisma.zonePart.create({
        data: {
          zoneId: zoneAssignment.zoneId,
          partId: part.id,
          calloutNumber: zoneAssignment.calloutNumber,
        },
      });
    }
  }

  console.log("Inventory…");
  const inventoryRows = readCsv<{
    "كود القطعة (SKU)": string;
    "كود المورد": string;
    "سعر التكلفة": string;
    "هامش الربح": string;
    "الكمية بمخزن TD": string;
    "الكمية عند المندوب": string;
  }>("inventory_pricing.csv");
  for (const row of inventoryRows) {
    const partId = partIdBySku.get(row["كود القطعة (SKU)"]);
    const supplierId = supplierIdByCode.get(row["كود المورد"]);
    if (!partId || !supplierId) continue;
    await prisma.inventory.create({
      data: {
        partId,
        supplierId,
        cost: row["سعر التكلفة"],
        marginRate: row["هامش الربح"],
        stockInternal: Math.round(Number(row["الكمية بمخزن TD"])),
        stockSupplier: Math.round(Number(row["الكمية عند المندوب"])),
      },
    });
  }

  console.log("DemandGap…");
  const demandGapRows = readCsv<{
    التاريخ: string;
    "نص البحث كما كتبه العميل": string;
    "رقم OEM (إن وُجد)": string;
    الماركة: string;
    الموديل: string;
    السنة: string;
    المدينة: string;
    "سبب عدم التوفر": string;
  }>("demand_gap.csv");
  for (const row of demandGapRows) {
    await prisma.demandGap.create({
      data: {
        searchText: row["نص البحث كما كتبه العميل"] || null,
        oemNumber: row["رقم OEM (إن وُجد)"] || null,
        make: row["الماركة"] || null,
        model: row["الموديل"] || null,
        year: row["السنة"] ? Math.round(Number(row["السنة"])) : null,
        cityId: cityIdByName.get(row["المدينة"]) ?? null,
        reason: row["سبب عدم التوفر"],
        createdAt: new Date(row["التاريخ"]),
      },
    });
  }

  console.log("اكتمل البذر.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
