"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { normalizeArabic } from "@/lib/arabic-text";

export interface SearchOption {
  value: string;
  label: string;
}

/** ما يبدأ بالنص أولاً، ثم ما يحتويه — بالترتيب الأصلي داخل كل مجموعة */
function filterOptions(options: SearchOption[], query: string): SearchOption[] {
  const q = normalizeArabic(query);
  if (!q) return options;
  const starts: SearchOption[] = [];
  const contains: SearchOption[] = [];
  for (const option of options) {
    const label = normalizeArabic(option.label);
    if (label.startsWith(q)) starts.push(option);
    else if (label.includes(q)) contains.push(option);
  }
  return [...starts, ...contains];
}

/**
 * قائمة يُبحث فيها بالكتابة — نمط combobox من ARIA 1.2: الأسهم تتنقل، Enter
 * يختار، Escape يغلق. البحث يقبل الكتابات الشائعة («اكورد» = «أكورد»، «2022» = «٢٠٢٢»).
 */
export function SearchSelect({
  label,
  options,
  value,
  onChange,
  disabled = false,
  placeholder,
  renderEmpty,
}: {
  label: string;
  options: SearchOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** يظهر داخل القائمة حين لا تطابق الكتابة أي خيار، ويُمرَّر له النص المكتوب */
  renderEmpty?: (query: string) => ReactNode;
}) {
  const id = useId();
  const inputId = `${id}-input`;
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const [active, setActive] = useState(-1);

  const selected = options.find((o) => o.value === value);
  const editing = query !== null;
  const shown = filterOptions(options, query ?? "");

  function close() {
    setOpen(false);
    setQuery(null);
    setActive(-1);
  }

  function choose(option: SearchOption) {
    onChange(option.value);
    close();
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!open) setOpen(true);
        setActive((i) => Math.min(i + 1, shown.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        if (open && active >= 0 && shown[active]) {
          e.preventDefault();
          choose(shown[active]);
        }
        break;
      case "Escape":
        if (open || editing) {
          e.preventDefault();
          close();
        }
        break;
    }
  }

  const activeId = open && active >= 0 && shown[active] ? `${id}-opt-${active}` : undefined;

  return (
    <div className="combo">
      <label className="label" htmlFor={inputId}>
        {label}
      </label>
      <input
        ref={inputRef}
        id={inputId}
        className="input combo-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={activeId}
        autoComplete="off"
        spellCheck={false}
        disabled={disabled}
        placeholder={placeholder}
        value={editing ? query : (selected?.label ?? "")}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(e.target.value.trim() ? 0 : -1);
        }}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onBlur={close}
        onKeyDown={onKeyDown}
      />
      {open && !disabled && (
        <div className="combo-pop" onMouseDown={(e) => e.preventDefault()}>
          <ul id={listId} role="listbox" aria-label={label} className="combo-list">
            {shown.map((option, i) => (
              <li
                key={option.value}
                id={`${id}-opt-${i}`}
                role="option"
                aria-selected={option.value === value}
                data-active={i === active || undefined}
                className="combo-opt"
                // حركة فعلية لا مجرد دخول: المؤشر الساكن فوق القائمة لا يسرق التنقل بالأسهم
                onMouseMove={() => {
                  if (active !== i) setActive(i);
                }}
                onClick={() => choose(option)}
              >
                {option.label}
              </li>
            ))}
          </ul>
          {shown.length === 0 && (
            <div className="combo-empty">
              <span>لا نتائج لـ«{query}»</span>
              {renderEmpty?.(query ?? "")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
