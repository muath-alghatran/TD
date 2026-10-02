"use client";

import { useRef, useState, type FormEvent, type MouseEvent } from "react";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { SearchSelect } from "@/components/ui/SearchSelect";
import { logDemandGap } from "@/lib/demand-gap";
import { formatYearRange, toArabicDigits } from "@/lib/format";
import { FEATURE_FORM_OCR, extractVehicleForm } from "@/lib/ocr";
import { CATALOG_MAKES, catalogYears, generationsFor, makeOptions, modelOptions, resolveModel } from "@/lib/vehicle-catalog";
import { cleanVinInput, isCompleteVin } from "@/lib/vin";
import { buildVehicleNotListedMessage, buildWhatsAppLink } from "@/lib/whatsapp-requests";
import { VinField } from "./VinField";

export interface VehicleIdentifyResult {
  make: string;
  model: string;
  year: number;
  /** فارغ حين لا يُدخله العميل */
  vin: string;
  /** رمز الجيل (قاعدة 7) — فارغ حين لا يُعرف فيحدده المركز عند التأكيد */
  generationCode: string;
}

/** خيار «لا أعرف» في سؤال الجيل */
const GENERATION_UNKNOWN = "unknown";
const MAKE_OPTIONS = makeOptions();

/** «حدّد سيارتك»: الماركة ← الموديل ← السنة، ثم رقم الهيكل اختيارياً */
export function VehicleIdentifyForm({ onIdentified }: { onIdentified: (result: VehicleIdentifyResult) => void }) {
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  /** اختيار العميل في سنة التحول — مفتاح الجيل أو «لا أعرف» */
  const [generationPick, setGenerationPick] = useState<string | null>(null);
  const [vin, setVin] = useState("");

  const [notListedOpen, setNotListedOpen] = useState(false);
  const [notListedText, setNotListedText] = useState("");
  const [notListedSent, setNotListedSent] = useState(false);
  const notListedRef = useRef<HTMLInputElement>(null);
  const lastLoggedText = useRef<string | null>(null);

  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const models = make ? modelOptions(make) : [];
  const years = make && model ? catalogYears(make, model) : [];
  const generations = make && model && year ? generationsFor(make, model, Number(year)) : [];
  const askGeneration = generations.length > 1;
  const generationKey = (g: (typeof generations)[number]) => `${g.generationCode}|${g.yearFrom}`;
  const generationCode = askGeneration
    ? (generations.find((g) => generationKey(g) === generationPick)?.generationCode ?? "")
    : (generations[0]?.generationCode ?? "");
  const vinOk = vin === "" || isCompleteVin(vin);
  const canContinue = Boolean(make && model && year) && vinOk && (!askGeneration || generationPick !== null);
  const notListedValue = notListedText.trim();

  function chooseMake(next: string) {
    setMake(next);
    setModel("");
    chooseYear("");
  }

  function chooseYear(next: string) {
    setYear(next);
    setGenerationPick(null);
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
    if (CATALOG_MAKES.includes(readMake)) {
      chooseMake(readMake);
      const readModel = resolveModel(readMake, read.model.value);
      if (readModel) {
        setModel(readModel);
        if (catalogYears(readMake, readModel).includes(read.year.value)) chooseYear(String(read.year.value));
      }
    }
    setVin(cleanVinInput(read.vin.value).value);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!canContinue) return;
    onIdentified({ make, model, year: Number(year), vin, generationCode });
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
            options={MAKE_OPTIONS}
            value={make}
            onChange={chooseMake}
            renderEmpty={(q) => notListedAction(q)}
          />
        </div>
        <div className="form-block">
          <SearchSelect
            label="الموديل"
            placeholder={make ? "اكتب أو اختر الموديل" : "اختر الماركة أولاً"}
            options={models}
            value={model}
            onChange={(next) => {
              setModel(next);
              chooseYear("");
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
            onChange={chooseYear}
            disabled={!model}
            renderEmpty={(q) => notListedAction(`${make} ${model} ${q}`)}
          />
        </div>

        {askGeneration && (
          <fieldset className="form-block">
            <legend className="label">أي جيل؟</legend>
            <p className="hint" style={{ marginTop: 0, marginBottom: 10 }}>
              سنة {toArabicDigits(year)} فيها جيلان من {model}، وبعض القطع تختلف بينهما.
            </p>
            {generations.map((g, i) => (
              <button
                key={generationKey(g)}
                type="button"
                className="choice"
                aria-pressed={generationPick === generationKey(g)}
                onClick={() => setGenerationPick(generationKey(g))}
              >
                <span className="dot" />
                <span className="gen-say">
                  <span className="gen-name">
                    {i === 0 ? "الجيل الأقدم" : "الجيل الأحدث"}
                    {g.generationCode && <span className="t-code gen-code">{g.generationCode}</span>}
                  </span>
                  <span className="gen-sub">موديلات {formatYearRange(g.yearFrom, g.yearTo)}</span>
                </span>
              </button>
            ))}
            <button
              type="button"
              className="choice"
              aria-pressed={generationPick === GENERATION_UNKNOWN}
              onClick={() => setGenerationPick(GENERATION_UNKNOWN)}
            >
              <span className="dot" />
              <span className="gen-say">
                <span className="gen-name">لا أعرف</span>
                <span className="gen-sub">يحدده المركز من رقم الهيكل عند التأكيد</span>
              </span>
            </button>
          </fieldset>
        )}

        <VinField value={vin} onChange={setVin} selectedMake={make} knownMakes={CATALOG_MAKES} onSwitchMake={chooseMake} />

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
