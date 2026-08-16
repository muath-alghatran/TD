"use client";

import { useEffect, useState } from "react";
import { Sheet } from "@/components/ui/Sheet";
import { Tag } from "@/components/ui/Tag";
import { toArabicDigits } from "@/lib/format";
import { listDemandGaps, type DemandGapEntry } from "@/lib/demand-gap";

interface GroupedGap {
  oemNumber: string;
  partName: string;
  count: number;
  cities: Set<string>;
  latest: string;
}

function groupByOem(entries: DemandGapEntry[]): GroupedGap[] {
  const map = new Map<string, GroupedGap>();
  for (const entry of entries) {
    const key = entry.oemNumber || entry.partName;
    const existing = map.get(key);
    if (existing) {
      existing.count++;
      existing.cities.add(entry.cityName);
      if (entry.createdAt > existing.latest) existing.latest = entry.createdAt;
    } else {
      map.set(key, {
        oemNumber: entry.oemNumber,
        partName: entry.partName,
        count: 1,
        cities: new Set([entry.cityName]),
        latest: entry.createdAt,
      });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}

export default function AdminDemandGapPage() {
  const [entries, setEntries] = useState<DemandGapEntry[] | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => setEntries(listDemandGaps()));
  }, []);

  if (!entries) return null;

  const grouped = groupByOem(entries);

  return (
    <div>
      <div className="lede">
        <span className="t-eyebrow">لوحة التحكم</span>
        <h1>الطلب المفقود</h1>
        <p>مرتّب بالتكرار — هذه البيانات ستحدد أي قطع تُصنَّع محلياً بعد سنتين (docs/CLAUDE.md قاعدة 8).</p>
      </div>

      {grouped.length === 0 ? (
        <Sheet>
          <p style={{ color: "var(--text-2)", fontSize: 13.5 }}>لا سجلات بعد.</p>
        </Sheet>
      ) : (
        <div className="flex flex-col gap-2.5">
          {grouped.map((g) => (
            <Sheet key={g.oemNumber || g.partName}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="t-disp" style={{ fontWeight: 500, fontSize: 15.5 }}>
                    {g.partName}
                  </div>
                  {g.oemNumber && (
                    <div className="t-data" style={{ fontSize: 11.5, color: "var(--text-3)", marginTop: 2 }}>
                      {g.oemNumber}
                    </div>
                  )}
                </div>
                <div className="t-disp" style={{ fontWeight: 700, fontSize: 20 }}>
                  {toArabicDigits(g.count)}
                </div>
              </div>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {[...g.cities].map((city) => (
                  <Tag key={city}>{city}</Tag>
                ))}
              </div>
            </Sheet>
          ))}
        </div>
      )}
    </div>
  );
}
