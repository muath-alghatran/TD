import Link from "next/link";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { WORK_KIND_LABEL, type CertificateData } from "@/lib/certificate-schema";
import { formatFullDate } from "@/lib/format";
import { vehicleLabel } from "@/lib/garage";
import { BodyworkStageArt } from "./BodyworkStageArt";

/** حالات الشهادة في المرحلة 9 — النموذج «سارية» دائماً */
export type CertificateStatus = "valid" | "superseded" | "revoked";
const STATUS_TEXT: Record<CertificateStatus, string> = {
  valid: "شهادة سارية",
  superseded: "مُستبدلة بإصدار أحدث",
  revoked: "ملغاة",
};

/**
 * ما يراه المشتري حين يمسح رمز QR — ملخص الشهادة وحالتها وحالة الضمان، ثم «احجز فحصاً».
 * بالشكل نفسه الذي سيكون في المرحلة 9 (‎/verify/[token]‎)، والحالة بالفولاذي لا بالأخضر (قاعدة 1).
 */
export function VerifyView({ data, status }: { data: CertificateData; status: CertificateStatus }) {
  return (
    <>
      {data.sample && (
        <p className="cert-banner verify-banner" role="note">
          <b>نموذج.</b> هذه صفحة توضيحية لما يراه المشتري حين يمسح رمز الشهادة — لا تخص سيارة عميل حقيقية.
        </p>
      )}

      <section className="blueprint verify-status" aria-labelledby="verify-title">
        <Corners />
        <Icon name="badgeCheck" size={30} className="verify-ic" />
        <div>
          <h1 id="verify-title" className="verify-title">
            {STATUS_TEXT[status]}
          </h1>
          <p className="verify-sub">
            صادرة من ترست درايف · <span className="t-data">{data.number}</span>
          </p>
          <p className="verify-sub">تاريخ الإصدار: {formatFullDate(new Date(data.issuedAt))}</p>
        </div>
      </section>

      <section className="verify-sec" aria-labelledby="verify-vehicle">
        <h2 id="verify-vehicle" className="sec-title">
          السيارة
        </h2>
        <p className="verify-car">
          {vehicleLabel(data.vehicle)} · الجيل <span className="t-data">{data.vehicle.generationCode}</span>
        </p>
        <p className="hint">
          رقم الهيكل: <span className="t-data">{data.vehicle.vin}</span>
          {data.vehicle.vinIsExample && " (مثال)"}
        </p>
      </section>

      <section className="verify-sec" aria-labelledby="verify-works">
        <h2 id="verify-works" className="sec-title">
          الأعمال المنجزة
        </h2>
        <ul className="verify-works">
          {data.works.map((work) => (
            <li key={`${work.date}-${work.kind}`}>
              <div className="verify-work-hd">
                <span className="tag tag-outline">{WORK_KIND_LABEL[work.kind]}</span>
                <b>{work.title}</b>
                <span className="cert-date">{formatFullDate(new Date(work.date))}</span>
              </div>
              {work.parts.length > 0 && <p className="verify-parts">{work.parts.map((p) => p.name).join("، ")}</p>}
              {work.stages.length > 0 && (
                <div className="verify-ba">
                  {work.stages
                    .filter((s) => s.stage === "before" || s.stage === "painted")
                    .map((s) => (
                      <figure key={s.stage}>
                        <BodyworkStageArt stage={s.stage} className="cert-art" />
                        <figcaption>
                          {s.stage === "before" ? "قبل" : "بعد"} · صورة توضيحية
                        </figcaption>
                      </figure>
                    ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>

      {data.warranty && (
        <section className="verify-sec" aria-labelledby="verify-warranty">
          <h2 id="verify-warranty" className="sec-title">
            الضمان الآن
          </h2>
          <p className="verify-car">
            يشمل {data.warranty.covers} · المدة {data.warranty.term}
            {data.warranty.termIsExample && " (مثال)"}
          </p>
          <span className="tag tag-outline" style={{ marginTop: 8 }}>
            {data.warranty.status}
          </span>
        </section>
      )}

      <Link href="/booking" className="btn btn-primary btn-lg btn-block blueprint" style={{ marginTop: 28 }}>
        <Corners />
        <Icon name="calendarCheck" size={20} />
        احجز فحصاً في ترست درايف
      </Link>
    </>
  );
}
