"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { logDemandGap } from "@/lib/demand-gap";
import { toArabicDigits } from "@/lib/format";
import { FEATURE_FORM_OCR, extractVehicleForm } from "@/lib/ocr";
import { VEHICLE_CATALOG } from "@/lib/vehicle-catalog";
import { cleanVinInput, isCompleteVin } from "@/lib/vin";
import { buildVehicleNotListedMessage, buildWhatsAppLink } from "@/lib/whatsapp-requests";
import { VinField } from "./VinField";

export interface VehicleIdentifyResult {
  make: string;
  model: string;
  year: number;
  /** فارغ حين لا يُدخله العميل */
  vin: string;
}

const MAKES = Object.keys(VEHICLE_CATALOG);

/** «حدّد سيارتك»: الماركة ← الموديل ← السنة، ثم رقم الهيكل اختيارياً */
export function VehicleIdentifyForm({ onIdentified }: { onIdentified: (result: VehicleIdentifyResult) => void }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");

  const [notListedOpen, setNotListedOpen] = useState(false);
  const [notListedText, setNotListedText] = useState("");
  const [notListedSent, setNotListedSent] = useState(false);
  const notListedRef = useRef<HTMLInputElement>(null);
  const lastLoggedText = useRef<string | null>(null);

  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const models = make ? Object.keys(VEHICLE_CATALOG[make]) : [];
  const years = make && model ? VEHICLE_CATALOG[make][model] : [];
  const vinOk = vin === "" || isCompleteVin(vin);
  const canContinue = Boolean(make && model && year) && vinOk;
  const notListedValue = notListedText.trim();

  function chooseMake(next: string) {
    setMake(next);
    setModel("");
    setYear("");
  }

  function openNotListed(prefill: string) {
    setNotListedOpen(true);
    setNotListedText(prefill.trim());
    requestAnimationFrame(() => notListedRef.current?.focus());
  }

  function notListedAction(query: string) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => openNotListed(query)}>
        سيارتي غير موجودة في القائمة
      </button>
    );
  }

  function handleNotListedRequest(e: MouseEvent<HTMLAnchorElement>) {
    if (!notListedValue) {
      e.preventDefault();
      return;
    }
    // يُسجَّل النص النهائي مرة واحدة — الضغط مرتين على النص نفسه لا يكرر السجل (قاعدة 8)
    if (lastLoggedText.current !== notListedValue) {
      lastLoggedText.current = notListedValue;
      logDemandGap({
        oemNumber: "",
        partName: "",
        make: "",
        model: "",
        year: 0,
        cityName: "",
        searchText: notListedValue,
        reason: "سيارة غير موجودة في القائمة",
      });
    }
    setNotListedSent(true);
  }

  async function fillFromForm(file: File) {
    setReading(true);
    const read = await extractVehicleForm(file);
    setReading(false);
    const readMake = read.make.value;
    if (VEHICLE_CATALOG[readMake]) {
      chooseMake(readMake);
      const readModel = read.model.value;
      if (VEHICLE_CATALOG[readMake][readModel]) {
        setModel(readModel);
        if (VEHICLE_CATALOG[readMake][readModel].includes(read.year.value)) setYear(String(read.year.value));
      }
    }
    setVin(cleanVinInput(read.vin.value).value);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    onIdentified({ make, model, year: Number(year), vin });
  }

  return (
    <section>
      <div className="lede">
        <h1>حدّد سيارتك</h1>
        <p>الماركة والموديل والسنة تكفي لنبدأ. ورقم الهيكل — إن كان عندك — يزيد دقة القطع.</p>
      </div>

      {FEATURE_FORM_OCR && (
        <>
          <button
            type="button"
            className="btn btn-secondary btn-block"
            disabled={reading}
            onClick={() => fileRef.current?.click()}
          >
            <Icon name="camera" size={18} />
            {reading ? "جارٍ قراءة الاستمارة…" : "املأ من صورة الاستمارة"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void fillFromForm(file);
            }}
          />
        </>
      )}

      <form noValidate onSubmit={submit}>
        <div className="form-block">
          <SearchSelect
            label="الماركة"
            placeholder="اكتب أو اختر — مثل: تويوتا"
            options={MAKES.map((m) => ({ value: m, label: m }))}
            value={make}
            onChange={chooseMake}
            renderEmpty={(q) => notListedAction(q)}
          />
        </div>
        <div className="form-block">
          <SearchSelect
            label="الموديل"
            placeholder={make ? "اكتب أو اختر الموديل" : "اختر الماركة أولاً"}
            options={models.map((m) => ({ value: m, label: m }))}
            value={model}
            onChange={(next) => {
              setModel(next);
              setYear("");
            }}
            disabled={!make}
            renderEmpty={(q) => notListedAction(`${make} ${q}`)}
          />
        </div>
        <div className="form-block">
          <SearchSelect
            label="سنة الصنع"
            placeholder={model ? "اكتب أو اختر السنة" : "اختر الموديل أولاً"}
            options={years.map((y) => ({ value: String(y), label: toArabicDigits(y) }))}
            value={year}
            onChange={setYear}
            disabled={!model}
            renderEmpty={(q) => notListedAction(`${make} ${model} ${q}`)}
          />
        </div>

        <VinField value={vin} onChange={setVin} selectedMake={make} knownMakes={MAKES} onSwitchMake={chooseMake} />

        <div className="form-block">
          <button type="submit" className="btn btn-primary btn-lg btn-block blueprint" disabled={!canContinue}>
            <Corners />
            متابعة
          </button>
          {!vinOk && <p className="hint">أكمل رقم الهيكل (١٧ خانة) أو امسحه للمتابعة بدونه.</p>}
        </div>
      </form>

      <div className="form-block not-listed">
        {!notListedOpen ? (
          <button type="button" className="btn btn-ghost" onClick={() => openNotListed("")}>
            سيارتي غير موجودة في القائمة
          </button>
        ) : (
          <>
            <label className="label" htmlFor="not-listed-text">
              اكتب سيارتك
            </label>
            <input
              ref={notListedRef}
              id="not-listed-text"
              className="input"
              value={notListedText}
              onChange={(e) => {
                setNotListedText(e.target.value);
                setNotListedSent(false);
              }}
              placeholder="الماركة والموديل والسنة — مثل: كيا سورينتو ٢٠١٩"
              autoComplete="off"
            />
            <p className="hint">نسجّلها لنضيفها للقائمة، وتكمل طلبك معنا على واتساب.</p>
            <a
              className="btn btn-secondary btn-block"
              style={{ marginTop: 12 }}
              href={notListedValue ? buildWhatsAppLink(buildVehicleNotListedMessage(notListedValue)) : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!notListedValue}
              onClick={handleNotListedRequest}
            >
              <Icon name="messageCircle" size={18} />
              اطلب قطعتك عبر واتساب
            </a>
            {notListedSent && (
              <div className="memo" role="status">
                <b>فتحنا لك واتساب برسالة جاهزة.</b> اكتب فيها القطعة التي تحتاجها وأرسلها.
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
