/**
 * قراءة استمارة المركبة — واجهة نظيفة خلف تنفيذ Mock حالياً.
 *
 * TODO(OCR حقيقي): استبدل تنفيذ extractVehicleForm بمزوّد حقيقي (Google Cloud
 * Vision، Azure AI Document Intelligence، أو غيره) حين يتوفر حساب ومفتاح API.
 * الشكل الناتج (VehicleFormExtraction) لن يتغير، فالمكوّنات المستهلكة
 * (VehicleIdentifyForm/VehicleConfirmCard) لن تحتاج تعديلاً.
 *
 * لا اتصال شبكة هنا الآن — تأخير اصطناعي فقط لمحاكاة زمن معالجة حقيقي،
 * مطابق لسلوك docs/prototype-parts.html (startScan → renderConf).
 */

export type FieldConfidence = "high" | "low";

export interface VehicleFormField<T> {
  value: T;
  confidence: FieldConfidence;
}

export interface VehicleFormExtraction {
  make: VehicleFormField<string>;
  model: VehicleFormField<string>;
  year: VehicleFormField<number>;
  trim: VehicleFormField<string>;
  vin: VehicleFormField<string>;
  plate: VehicleFormField<string>;
}

const MOCK_RESULT: VehicleFormExtraction = {
  make: { value: "تويوتا", confidence: "high" },
  model: { value: "كامري", confidence: "high" },
  year: { value: 2021, confidence: "high" },
  trim: { value: "2.5 لتر · فئة GLE · محرك 2AR-FE", confidence: "low" },
  vin: { value: "JTNBE46K173012345", confidence: "high" },
  plate: { value: "ر ن ح ٤٧٢٩", confidence: "high" },
};

/** يقرأ صورة استمارة المركبة ويستخرج حقولها بدرجة ثقة لكل حقل. */
export async function extractVehicleForm(_file: File): Promise<VehicleFormExtraction> {
  await new Promise((resolve) => setTimeout(resolve, 1900));
  return MOCK_RESULT;
}
