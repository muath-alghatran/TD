"use client";

import { useId, useRef, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import {
  VIN_LENGTH,
  applyVinLetterFixes,
  cleanVinInput,
  groupVin,
  vinLetterFixes,
  vinMakeConflict,
} from "@/lib/vin";
import { VinLocations } from "./VinLocations";

type InputNote = "invalid" | "overflow" | null;

/**
 * رقم الهيكل — اختياري. يُنظَّف فوراً (أحرف كبيرة، بلا مسافات أو شرطات، أرقام
 * لاتينية)، ويُعرض مجمّعاً للمراجعة، ويقترح تصحيح I/O/Q بدل الرفض الصامت،
 * وينبّه بلطف إن أشار إلى ماركة غير المختارة.
 */
export function VinField({
  value,
  onChange,
  selectedMake,
  knownMakes,
  onSwitchMake,
}: {
  value: string;
  onChange: (vin: string) => void;
  selectedMake: string;
  /** الماركات الموجودة في القائمة — لا نعرض «عدّل الاختيار» لماركة ليست فيها */
  knownMakes: string[];
  onSwitchMake: (make: string) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [note, setNote] = useState<InputNote>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  const fixes = vinLetterFixes(value);
  const conflict = selectedMake ? vinMakeConflict(value, selectedMake) : null;

  function handleInput(raw: string, caret: number) {
    const cleaned = cleanVinInput(raw);
    onChange(cleaned.value);
    setNote(cleaned.overflow ? "overflow" : cleaned.droppedInvalid ? "invalid" : null);
    // التنظيف يغيّر النص تحت المؤشر — نعيده إلى موضعه بدل القفز لآخر الحقل
    const position = Math.min(cleanVinInput(raw.slice(0, caret)).value.length, cleaned.value.length);
    requestAnimationFrame(() => inputRef.current?.setSelectionRange(position, position));
  }

  return (
    <div className="form-block">
      <label className="label" htmlFor={`${id}-vin`}>
        رقم الهيكل <span className="label-aside">— اختياري، ويزيد دقة القطع</span>
      </label>
      <input
        ref={inputRef}
        id={`${id}-vin`}
        className="vin"
        dir="ltr"
        inputMode="text"
        autoCapitalize="characters"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
        value={value}
        aria-describedby={`${id}-meta ${id}-status`}
        onChange={(e) => handleInput(e.target.value, e.target.selectionStart ?? e.target.value.length)}
      />
      <div id={`${id}-meta`} className="vin-meta">
        <span className="t-data">{value ? groupVin(value) : ""}</span>
        <span className="t-data">
          {value.length}/{VIN_LENGTH}
        </span>
      </div>

      <div id={`${id}-status`} aria-live="polite">
        {fixes.length > 0 && (
          <div className="vin-note">
            <span>
              رقم الهيكل لا يحتوي الأحرف «<span className="t-data">I</span>» و«<span className="t-data">O</span>» و«
              <span className="t-data">Q</span>».
            </span>
            <button type="button" className="btn btn-secondary" onClick={() => onChange(applyVinLetterFixes(value))}>
              {/* نص واحد داخل الزر — .btn مرن بفراغات بين عناصره */}
              <span>
                هل تقصد{" "}
                {fixes.map((f, i) => (
                  <span key={f.from}>
                    {i > 0 && " و"}
                    «<span className="t-data">{f.to}</span>» بدل «<span className="t-data">{f.from}</span>»
                  </span>
                ))}
                ؟
              </span>
            </button>
          </div>
        )}
        {note === "invalid" && <p className="hint">رقم الهيكل بحروف إنجليزية وأرقام فقط.</p>}
        {note === "overflow" && <p className="hint">رقم الهيكل ١٧ خانة فقط — راجع ما لصقته.</p>}
        {conflict && (
          <div className="vin-note">
            <span>
              رقم الهيكل يشير إلى {conflict}
              {knownMakes.includes(conflict) ? "، هل نعدّل الاختيار؟" : "، وهي ليست في القائمة بعد."}
            </span>
            {knownMakes.includes(conflict) && (
              <button type="button" className="btn btn-secondary" onClick={() => onSwitchMake(conflict)}>
                عدّل إلى {conflict}
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        className="btn btn-ghost vin-help-toggle"
        aria-expanded={helpOpen}
        aria-controls={`${id}-help`}
        onClick={() => setHelpOpen((open) => !open)}
      >
        وين ألقى رقم الهيكل؟
      </button>
      <div id={`${id}-help`} hidden={!helpOpen}>
        <Sheet className="vin-help">
          <VinLocations />
        </Sheet>
      </div>
    </div>
  );
}
