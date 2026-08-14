/**
 * مساعد فك رقم الهيكل عبر NHTSA vPIC — API عام مجاني بلا مفتاح.
 * docs/build-plan.md المرحلة 3: "NHTSA vPIC كمساعد للمحرك والفئة مع تخزين دائم للنتيجة".
 *
 * فشل لطيف دائماً (يُرجع null): لا يجوز أن يعطّل عدم توفر الشبكة أو عدم وجود
 * تطابق تدفق تأكيد السيارة — docs/brief.md: "لا تدع المستخدم يعلق أبداً".
 */

const NHTSA_ENDPOINT = "https://vpic.nhtsa.dot.gov/api/vehicles/decodevin";

export interface NhtsaVinAssist {
  engine: string | null;
  trim: string | null;
}

interface NhtsaResult {
  Variable: string;
  Value: string | null;
}

function pickValue(results: NhtsaResult[], variable: string): string | null {
  const value = results.find((r) => r.Variable === variable)?.Value;
  return value && value.trim().length > 0 ? value.trim() : null;
}

export async function fetchVinDecodeAssist(vin: string): Promise<NhtsaVinAssist | null> {
  try {
    const response = await fetch(`${NHTSA_ENDPOINT}/${encodeURIComponent(vin)}?format=json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;

    const data = (await response.json()) as { Results?: NhtsaResult[] };
    const results = data.Results ?? [];
    if (results.length === 0) return null;

    const engineModel = pickValue(results, "Engine Model");
    const displacement = pickValue(results, "Displacement (L)");
    const engine = engineModel ?? (displacement ? `${displacement} لتر` : null);
    const trim = pickValue(results, "Trim");

    if (!engine && !trim) return null;
    return { engine, trim };
  } catch {
    return null;
  }
}
