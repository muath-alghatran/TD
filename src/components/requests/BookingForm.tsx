"use client";

import { useState, type FormEvent } from "react";
import { ActionBar } from "@/components/shell/ActionBar";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { BOOKING_TIMES, CENTER } from "@/lib/center-info";
import { formatDayDate, formatDayNumber, formatMonth, formatWeekday } from "@/lib/format";
import { useGaragedVehicles, useHydrated, useNow } from "@/lib/local-store";
import { buildBookingMessage, buildWhatsAppLink } from "@/lib/whatsapp-requests";
import { displayTime } from "./time";
import { OTHER_VEHICLE, VehiclePicker, resolveVehicleText } from "./VehiclePicker";

const DAYS_AHEAD = 8;

/** حجز موعد فحص: السيارة · اليوم (لوح خلايا 1a) · الساعة — يُرسل طلباً على واتساب ويؤكَّد بشرياً */
export function BookingForm({ vehicleId }: { vehicleId?: string }) {
  const hydrated = useHydrated();
  const vehicles = useGaragedVehicles();
  const now = useNow();

  const [picked, setPicked] = useState<string | null>(vehicleId ?? null);
  const [otherText, setOtherText] = useState("");
  const [dayIndex, setDayIndex] = useState<number | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const fallback = vehicles.length > 0 ? vehicles[vehicles.length - 1].id : OTHER_VEHICLE;
  const selected = picked && (picked === OTHER_VEHICLE || vehicles.some((v) => v.id === picked)) ? picked : fallback;
  const vehicleText = resolveVehicleText(vehicles, selected, otherText);

  const days =
    now > 0
      ? Array.from({ length: DAYS_AHEAD }, (_, i) => {
          const d = new Date(now);
          d.setHours(12, 0, 0, 0);
          d.setDate(d.getDate() + i);
          return d;
        })
      : [];
  const day = dayIndex !== null ? days[dayIndex] : undefined;
  const valid = Boolean(vehicleText && day && time);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid || !day || !time) return;
    const t = displayTime(time);
    const message = buildBookingMessage({
      vehicle: vehicleText,
      dayLabel: formatDayDate(day),
      time: `${t.time} ${t.period === "ص" ? "صباحاً" : "مساءً"}`,
      notes: notes.trim(),
    });
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <>
      <main className="screen has-actionbar">
        <form id="booking-form" className="page" onSubmit={submit}>
          <p className="lead-note" style={{ marginTop: 20 }}>
            اختر اليوم والساعة المناسبة لك، ونؤكد الموعد معك على واتساب قبل اعتماده.
          </p>

          <div className="form-block">
            <span className="label">السيارة</span>
            {hydrated && (
              <VehiclePicker
                vehicles={vehicles}
                value={selected}
                onChange={setPicked}
                otherText={otherText}
                onOtherText={setOtherText}
              />
            )}
          </div>

          <fieldset className="form-block">
            <legend className="label">اليوم</legend>
            <div className="day-board">
              {days.map((d, i) => (
                <button
                  key={d.toISOString()}
                  type="button"
                  className="day-cell"
                  aria-pressed={dayIndex === i}
                  onClick={() => setDayIndex(i)}
                >
                  <span className="wd">{i === 0 ? "اليوم" : i === 1 ? "غداً" : formatWeekday(d)}</span>
                  <span className="dn">{formatDayNumber(d)}</span>
                  <span className="mo">{formatMonth(d)}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="form-block">
            <legend className="label">الساعة المقترحة</legend>
            <div className="chips">
              {BOOKING_TIMES.map((slot) => {
                const t = displayTime(slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    className="chip"
                    aria-pressed={time === slot}
                    onClick={() => setTime(slot)}
                  >
                    <span className="ltr">{t.time}</span> <span style={{ fontSize: 12 }}>{t.period}</span>
                  </button>
                );
              })}
            </div>
            <p className="hint">الساعة اقتراح منك، ونؤكدها حسب جدول الورشة.</p>
          </fieldset>

          <div className="form-block">
            <label className="label" htmlFor="booking-notes">
              وش تحتاج؟ <span style={{ fontWeight: 400, color: "var(--muted)" }}>(اختياري)</span>
            </label>
            <textarea
              id="booking-notes"
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="صف المشكلة أو الخدمة — مثل: صوت في الفرامل الأمامية"
            />
          </div>

          {sent && (
            <div className="memo" role="status">
              <b>فتحنا لك واتساب برسالة الحجز.</b> أرسلها، ونرد عليك بتأكيد الموعد.
            </div>
          )}
        </form>
      </main>

      <ActionBar>
        <button type="submit" form="booking-form" className="btn btn-primary btn-lg blueprint" disabled={!valid}>
          <Corners />
          <Icon name="messageCircle" size={20} />
          أرسل طلب الحجز
        </button>
        <a href={`tel:${CENTER.phoneTel}`} className="btn btn-secondary btn-icon" aria-label="اتصال مباشر">
          <Icon name="phone" size={20} />
        </a>
      </ActionBar>
    </>
  );
}
