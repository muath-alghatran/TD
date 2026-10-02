import { Shield, Wordmark } from "@/components/brand/Brand";
import { WORK_KIND_LABEL, type CertificateData, type CertificateStage } from "@/lib/certificate-schema";
import { formatFullDate, toArabicDigits } from "@/lib/format";
import { vehicleLabel } from "@/lib/garage";
import { BodyworkStageArt } from "./BodyworkStageArt";
import { QrCode } from "./QrCode";

/** «قبل» و«بعد» بارزتان في السمكرة (المرحلة 9) */
const HIGHLIGHT: Partial<Record<CertificateStage["stage"], string>> = { before: "قبل", painted: "بعد" };

function Example() {
  return <span className="cert-example">مثال</span>;
}

/**
 * قالب شهادة الإصلاح الرقمية — HTML/CSS واحد للشاشة والـPDF (A4 عمودي). يأخذ بيانات الشهادة
 * فقط: النموذج التوضيحي يمرر certificate-sample.ts، والمرحلة 9 ستمرر بيانات القاعدة للقالب نفسه.
 * بلا اسم العميل ولا جواله، وبلا توقيعات أو أختام مصطنعة.
 */
export function CertificateDocument({ data }: { data: CertificateData }) {
  const { vehicle, warranty } = data;
  return (
    <article className={`cert${data.sample ? " is-sample" : ""}`} aria-label={`شهادة إصلاح رقمية ${data.number}`}>
      {data.sample && (
        <div className="cert-watermark" aria-hidden="true">
          <span>نموذج توضيحي</span>
          <span>نموذج توضيحي</span>
          <span>نموذج توضيحي</span>
        </div>
      )}

      {data.sample && (
        <p className="cert-banner" role="note">
          <b>هذا نموذج توضيحي.</b> الشهادة الفعلية تُصدر لسيارتك بعد إنجاز العمل في مركز ترست درايف.
        </p>
      )}

      <header className="cert-head">
        <div className="cert-brand">
          <Shield size={46} />
          {/* الكلمة الداكنة على الورق والفاتح، والفاتحة في الوضع الداكن على الشاشة */}
          <span className="cert-wm-light">
            <Wordmark tone="dark" height={13} />
          </span>
          <span className="cert-wm-dark">
            <Wordmark tone="light" height={13} />
          </span>
        </div>
        <div>
          <h1 className="cert-title">شهادة إصلاح رقمية</h1>
          <dl className="cert-meta">
            <div>
              <dt>رقم الشهادة</dt>
              <dd className="t-data">{data.number}</dd>
            </div>
            <div>
              <dt>تاريخ الإصدار</dt>
              <dd>{formatFullDate(new Date(data.issuedAt))}</dd>
            </div>
          </dl>
        </div>
      </header>

      <section className="cert-sec" aria-labelledby="cert-vehicle">
        <h2 id="cert-vehicle" className="cert-h">
          السيارة
        </h2>
        <dl className="cert-grid">
          <div>
            <dt>السيارة</dt>
            <dd>{vehicleLabel(vehicle)}</dd>
          </div>
          <div>
            <dt>الجيل</dt>
            <dd className="t-data">{vehicle.generationCode}</dd>
          </div>
          <div>
            <dt>رقم الهيكل</dt>
            <dd>
              <span className="t-data">{vehicle.vin}</span>
              {vehicle.vinIsExample && <Example />}
            </dd>
          </div>
          <div>
            <dt>اللوحة</dt>
            <dd>مخفية</dd>
          </div>
        </dl>
      </section>

      <section className="cert-sec" aria-labelledby="cert-works">
        <h2 id="cert-works" className="cert-h">
          سجل الأعمال
        </h2>
        {data.works.map((work) => (
          <div key={`${work.date}-${work.kind}`} className="cert-work">
            <div className="cert-work-hd">
              <span className="tag tag-outline">{WORK_KIND_LABEL[work.kind]}</span>
              <b>{work.title}</b>
              <span className="cert-date">{formatFullDate(new Date(work.date))}</span>
            </div>

            {work.parts.length > 0 && (
              <div className="cert-table-wrap">
                <table className="cert-table">
                  <thead>
                    <tr>
                      <th scope="col">القطعة</th>
                      <th scope="col">رقم القطعة</th>
                      <th scope="col">الجودة</th>
                      <th scope="col">المنشأ</th>
                      <th scope="col">الكمية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {work.parts.map((part) => (
                      <tr key={part.name}>
                        <td>{part.name}</td>
                        <td className="t-data">{part.number}</td>
                        <td>{part.tier}</td>
                        <td>{part.origin ?? "—"}</td>
                        <td>{toArabicDigits(part.qty)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {data.sample && <p className="cert-note">أرقام القطع في هذا النموذج أمثلة.</p>}
              </div>
            )}

            {work.stages.length > 0 && (
              <div className="cert-stages">
                {work.stages.map((s) => (
                  <figure key={s.stage} className={`cert-stage${HIGHLIGHT[s.stage] ? " is-key" : ""}`}>
                    <div className="cert-stage-img">
                      {s.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- صورة الورشة في قالب يُطبع PDF
                        <img src={s.photo.src} alt={s.photo.alt} />
                      ) : (
                        <>
                          <BodyworkStageArt stage={s.stage} className="cert-art" />
                          <span className="cert-illus">صورة توضيحية</span>
                        </>
                      )}
                      {HIGHLIGHT[s.stage] && <span className="cert-ba">{HIGHLIGHT[s.stage]}</span>}
                    </div>
                    <figcaption>{s.label}</figcaption>
                  </figure>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {warranty && (
        <section className="cert-sec" aria-labelledby="cert-warranty">
          <h2 id="cert-warranty" className="cert-h">
            الضمان
          </h2>
          <dl className="cert-grid">
            <div>
              <dt>يشمل</dt>
              <dd>{warranty.covers}</dd>
            </div>
            <div>
              <dt>المدة</dt>
              <dd>
                {warranty.term}
                {warranty.termIsExample && <Example />}
              </dd>
            </div>
            <div>
              <dt>الحالة عند الإصدار</dt>
              <dd>
                <span className="tag tag-outline">{warranty.status}</span>
              </dd>
            </div>
          </dl>
        </section>
      )}

      <footer className="cert-foot">
        <QrCode value={data.verifyUrl} size={104} label="رمز QR للتحقق من الشهادة" />
        <div>
          <p>صادرة إلكترونياً من نظام ترست درايف — تحقّق من صحتها عبر الرمز.</p>
          <p className="t-data cert-link">{data.verifyUrl.replace(/^https?:\/\//, "")}</p>
        </div>
      </footer>
    </article>
  );
}
