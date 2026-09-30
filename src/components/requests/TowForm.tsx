"use client";

import { useState, type FormEvent } from "react";
import { ActionBar } from "@/components/shell/ActionBar";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { CENTER } from "@/lib/center-info";
import { useGaragedVehicles, useHydrated } from "@/lib/local-store";
import { buildTowMessage, buildWhatsAppLink } from "@/lib/whatsapp-requests";
import { OTHER_VEHICLE, VehiclePicker, resolveVehicleText } from "./VehiclePicker";

type GeoState = "idle" | "busy" | "ok" | "error";

/** طلب سطحة — التحويلة الجانبية على الطريق (1b): مجانية عند موافقتك على السعر */
export function TowForm() {
  const hydrated = useHydrated();
  const vehicles = useGaragedVehicles();

  const [picked, setPicked] = useState<string | null>(null);
  const [otherText, setOtherText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [mapLink, setMapLink] = useState<string | null>(null);
  const [geo, setGeo] = useState<GeoState>("idle");
  const [notes, setNotes] = useState("");
  const [sent, setSent] = useState(false);

  const fallback = vehicles.length > 0 ? vehicles[vehicles.length - 1].id : OTHER_VEHICLE;
  const selected = picked ?? fallback;
  const vehicleText = resolveVehicleText(vehicles, selected, otherText);
  const valid = Boolean(vehicleText && (mapLink || locationText.trim()));

  function locate() {
    if (!("geolocation" in navigator)) {
      setGeo("error");
      return;
    }
    setGeo("busy");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMapLink(`https://maps.google.com/?q=${latitude.toFixed(6)},${longitude.toFixed(6)}`);
        setGeo("ok");
      },
      () => setGeo("error"),
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;
    const message = buildTowMessage({
      vehicle: vehicleText,
      locationText: locationText.trim(),
      mapLink,
      notes: notes.trim(),
    });
    window.open(buildWhatsAppLink(message), "_blank", "noopener,noreferrer");
    setSent(true);
  }

  return (
    <>
      <main className="screen has-actionbar">
        <form id="tow-form" className="page" onSubmit={submit}>
          <div className="detour" style={{ marginTop: 20 }}>
            <Icon name="truck" size={24} />
            <div>
              <div className="t-code">تحويلة · DETOUR</div>
              <p style={{ fontSize: 15, lineHeight: 1.7, marginTop: 6 }}>{CENTER.towPromise}</p>
            </div>
          </div>

          <ol className="steps" style={{ marginTop: 16 }}>
            <li>نرسل السطحة إلى موقعك وتنقل سيارتك إلى المركز.</li>
            <li>نفحص السيارة ونرسل لك السعر مفصّلًا قبل أي عمل.</li>
            <li>إذا وافقت على السعر، تكون السطحة مجانية.</li>
          </ol>

          <div className="form-block">
            <span className="label">موقعك</span>
            <button type="button" className="btn btn-secondary btn-block" onClick={locate} disabled={geo === "busy"}>
              <Icon name="locate" size={18} />
              {geo === "busy" ? "جارٍ تحديد موقعك…" : geo === "ok" ? "حُدّد موقعك — اضغط للتحديث" : "استخدم موقعي الحالي"}
            </button>
            {geo === "ok" && mapLink && (
              <p className="hint" role="status">
                <Icon name="check" size={13} className="inline" /> سنرسل موقعك على الخريطة مع الطلب.
              </p>
            )}
            {geo === "error" && (
              <p className="hint" role="status">
                ما قدرنا نحدد موقعك. اكتب الحي أو وصف المكان تحت.
              </p>
            )}
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={locationText}
              onChange={(e) => setLocationText(e.target.value)}
              placeholder="الحي أو وصف المكان — مثل: حي النقرة، قرب محطة…"
              aria-label="الحي أو وصف المكان"
              autoComplete="street-address"
            />
          </div>

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

          <div className="form-block">
            <label className="label" htmlFor="tow-notes">
              وش صار للسيارة؟ <span style={{ fontWeight: 400, color: "var(--muted)" }}>(اختياري)</span>
            </label>
            <textarea
              id="tow-notes"
              className="textarea"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثل: ما تشتغل، أو صوت قوي في المحرك"
            />
          </div>

          {sent && (
            <div className="memo" role="status">
              <b>فتحنا لك واتساب برسالة الطلب.</b> أرسلها، ونتواصل معك لترتيب السطحة.
            </div>
          )}
        </form>
      </main>

      <ActionBar>
        <button type="submit" form="tow-form" className="btn btn-primary btn-lg blueprint" disabled={!valid}>
          <Corners />
          <Icon name="truck" size={20} />
          أرسل طلب السطحة
        </button>
        <a href={`tel:${CENTER.phoneTel}`} className="btn btn-secondary btn-icon" aria-label="اتصال مباشر">
          <Icon name="phone" size={20} />
        </a>
      </ActionBar>
    </>
  );
}
