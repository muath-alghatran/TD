/** «16:00» → «4:00» + «م» — أوقات الحجز بساعة 12 وأرقام لاتينية */
export function displayTime(hhmm: string): { time: string; period: "ص" | "م" } {
  const [h, m] = hhmm.split(":").map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { time: `${h12}:${String(m).padStart(2, "0")}`, period: h < 12 ? "ص" : "م" };
}
