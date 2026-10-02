"use client";

import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import { logDemandGap } from "@/lib/demand-gap";
import { formatListPrice, toArabicDigits } from "@/lib/format";
import { highlightRanges, searchParts, type PartMatch } from "@/lib/part-search";
import { createSearchGapTracker, type SearchGapTracker } from "@/lib/part-search-gap";
import { categoryName, fromPrice } from "@/lib/parts-offer";
import { buildPartNotFoundMessage, buildWhatsAppLink, type PartRequestVehicle } from "@/lib/whatsapp-requests";

/** تأخير البحث بعد آخر حرف (البرومت: نحو 120ms) */
const DEBOUNCE_MS = 120;

export interface SearchVehicle extends PartRequestVehicle {
  make: string;
  model: string;
  year: number;
}

/** النص بإبراز الكلمات المطابقة للبحث */
function Highlighted({ text, query }: { text: string; query: string }) {
  const ranges = highlightRanges(text, query);
  if (ranges.length === 0) return <>{text}</>;
  const parts: ReactNode[] = [];
  let at = 0;
  ranges.forEach(([start, end], i) => {
    if (start > at) parts.push(<Fragment key={`t${i}`}>{text.slice(at, start)}</Fragment>);
    parts.push(
      <mark key={`m${i}`} className="ps-mark">
        {text.slice(start, end)}
      </mark>,
    );
    at = end;
  });
  if (at < text.length) parts.push(<Fragment key="tail">{text.slice(at)}</Fragment>);
  return <>{parts}</>;
}

/**
 * «ابحث عن قطعة» (المرحلة 5): نتائج «أفضل تطابق» ثم «قريب مما تبحث عنه» بشارة الفئة وأقل
 * سعر استرشادي، بالأسهم وEnter. البحث الفاشل يُسجَّل بنصه النهائي في DemandGap (قاعدة 8)،
 * و«ما لقيت قطعتي» يفتح طلباً مُعبّأ على واتساب.
 */
export function PartSearch({
  vehicle,
  initialQuery = "",
  onQueryChange,
  onPick,
}: {
  vehicle: SearchVehicle | null;
  initialQuery?: string;
  onQueryChange?: (query: string) => void;
  onPick: (key: string) => void;
}) {
  const id = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [open, setOpen] = useState(initialQuery.trim() !== "");
  const [active, setActive] = useState(-1);
  const [missOpen, setMissOpen] = useState(false);

  const result = useMemo(() => searchParts(query), [query]);
  const options: PartMatch[] = useMemo(() => (result.best ? [result.best, ...result.near] : result.near), [result]);

  // سجل البحث الفاشل — نسخة واحدة لعمر الحقل، والسيارة الحالية تُقرأ عند التسجيل
  const vehicleRef = useRef(vehicle);
  const trackerRef = useRef<SearchGapTracker | null>(null);
  useEffect(() => {
    vehicleRef.current = vehicle;
  }, [vehicle]);
  useEffect(() => {
    const tracker = createSearchGapTracker({
      onGap: (searchText, reason) => {
        const v = vehicleRef.current;
        logDemandGap({
          oemNumber: "",
          partName: "",
          make: v?.make ?? "",
          model: v?.model ?? "",
          year: v?.year ?? 0,
          cityName: "",
          searchText,
          reason: `بحث قطعة: ${reason}`,
        });
      },
    });
    trackerRef.current = tracker;
    return () => tracker.leave();
  }, []);

  useEffect(() => {
    if (text === query) return;
    const timer = setTimeout(() => setQuery(text), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text, query]);

  useEffect(() => {
    trackerRef.current?.input(query, result.failed);
    onQueryChange?.(query);
  }, [query, result.failed, onQueryChange]);

  function pick(match: PartMatch) {
    trackerRef.current?.pick();
    setOpen(false);
    onPick(match.type.key);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setOpen(true);
        setActive((i) => Math.min(i + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Enter": {
        e.preventDefault();
        // الحرف الأخير ربما لم يُبحث بعد — Enter يبحث بالنص كما هو الآن
        const now = text === query ? options : (() => {
          const r = searchParts(text);
          return r.best ? [r.best, ...r.near] : r.near;
        })();
        const chosen = now[active >= 0 && text === query ? active : 0];
        if (chosen) pick(chosen);
        break;
      }
      case "Escape":
        if (open) {
          e.preventDefault();
          setOpen(false);
        }
        break;
    }
  }

  const listId = `${id}-list`;
  const optionId = (i: number) => `${id}-opt-${i}`;
  const showResults = open && query.trim() !== "";
  const hasOptions = options.length > 0;
  // إعلان واحد ثابت لقارئ الشاشة: عدد النتائج أو تعذّر البحث
  const announcement = !query.trim()
    ? ""
    : result.failed
      ? `ما وجدنا «${query.trim()}» في قاموس القطع`
      : `${toArabicDigits(options.length)} ${options.length === 1 ? "نتيجة" : "نتائج"}`;
  const notFoundLink = buildWhatsAppLink(buildPartNotFoundMessage({ vehicle, searchText: text.trim() }));

  function renderOption(match: PartMatch, i: number) {
    const from = fromPrice(match.type.key);
    return (
      <div
        key={match.type.key}
        id={optionId(i)}
        role="option"
        aria-selected={i === active}
        data-active={i === active || undefined}
        className="ps-opt"
        onMouseMove={() => i !== active && setActive(i)}
        onClick={() => pick(match)}
      >
        <span className="ps-opt-main">
          <span className="ps-name">
            {match.matchedIsName ? <Highlighted text={match.type.name} query={query} /> : match.type.name}
          </span>
          {!match.matchedIsName && (
            <span className="ps-alias">
              «<Highlighted text={match.matchedText} query={query} />»
            </span>
          )}
        </span>
        <span className="ps-opt-side">
          <span className="tag tag-neutral">{categoryName(match.type.category)}</span>
          <span className="ps-from">
            {from !== null ? (
              <>
                من <span className="t-data">{formatListPrice(from)}</span> ر.س
              </>
            ) : (
              "السعر عند التأكيد"
            )}
          </span>
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="ps"
      onBlur={(e) => {
        // الخروج من منطقة البحث كلها (لا التنقل داخلها) = ترك البحث
        if (!containerRef.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          trackerRef.current?.leave();
        }
      }}
    >
      <label className="label" htmlFor={`${id}-input`}>
        ابحث عن قطعة
      </label>
      <div className="ps-field">
        <svg className="ps-ic" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="M15.5 15.5 21 21" strokeLinecap="round" />
        </svg>
        <input
          id={`${id}-input`}
          className="input ps-input"
          type="search"
          role="combobox"
          aria-expanded={showResults && hasOptions}
          aria-controls={showResults && hasOptions ? listId : undefined}
          aria-autocomplete="list"
          aria-activedescendant={showResults && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          placeholder="ابحث عن قطعة… مثل: قماش، رديتر، كمبروسر"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOpen(true);
            setActive(-1);
            setMissOpen(false);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
        />
      </div>

      {showResults && (
        <div className="ps-pop" onMouseDown={(e) => e.preventDefault()}>
          {hasOptions && (
            <div id={listId} role="listbox" aria-label="نتائج البحث عن قطعة" className="ps-list">
              {result.best && (
                <div role="group" aria-labelledby={`${id}-best`}>
                  <div id={`${id}-best`} className="ps-hd">
                    أفضل تطابق
                  </div>
                  {renderOption(result.best, 0)}
                </div>
              )}
              {result.near.length > 0 && (
                <div role="group" aria-labelledby={`${id}-near`}>
                  <div id={`${id}-near`} className="ps-hd">
                    {result.best ? "قريب مما تبحث عنه" : "أقرب ما وجدنا"}
                  </div>
                  {result.near.map((m, i) => renderOption(m, i + (result.best ? 1 : 0)))}
                </div>
              )}
            </div>
          )}
          {result.failed && (
            <p className="ps-empty">
              ما وجدنا «{query.trim()}» في قاموس القطع. اطلبها منا مباشرة ونبحث لك عنها.
            </p>
          )}
          <button
            type="button"
            className="ps-miss"
            onClick={() => {
              trackerRef.current?.notFound();
              setMissOpen(true);
            }}
          >
            ما لقيت قطعتي
          </button>
        </div>
      )}

      <p className="sr-only" role="status">
        {announcement}
      </p>

      {(missOpen || (result.failed && query.trim() !== "")) && (
        <a className="btn btn-secondary btn-block ps-wa" href={notFoundLink} target="_blank" rel="noopener noreferrer">
          <Icon name="messageCircle" size={18} />
          اطلب «{text.trim()}» عبر واتساب
        </a>
      )}
    </div>
  );
}
