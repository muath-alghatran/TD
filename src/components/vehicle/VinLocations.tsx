/**
 * «وين ألقى رقم الهيكل؟» — ثلاثة مواضع برسوم خطية بأسلوب النظام.
 * الرسوم زخرفية (aria-hidden): المعلومة كاملة في نص كل موضع.
 * بطاقة الاستمارة تخطيطية تبرز حقل الرقم فقط — بلا تقليد للتصميم الرسمي ولا شعارات.
 */

function FormCardDrawing() {
  return (
    <svg viewBox="0 0 120 72" className="vin-spot-art" aria-hidden="true">
      <rect className="vs-ln" x="8" y="6" width="104" height="60" />
      <path className="vs-faint" d="M16 16h44M16 26h60M16 48h52M16 57h36" />
      <rect className="vs-hi" x="13" y="32" width="94" height="10" />
      <path className="vs-hi-ln" d="M18 37h3M24 37h3M30 37h3M36 37h3M42 37h3M48 37h3M54 37h3M60 37h3M66 37h3M72 37h3M78 37h3M84 37h3M90 37h3M96 37h3" />
    </svg>
  );
}

/** من أمام السيارة: جهة السائق (يسار السيارة) تظهر يمين الناظر */
function WindshieldDrawing() {
  return (
    <svg viewBox="0 0 120 72" className="vin-spot-art" aria-hidden="true">
      <path className="vs-ln" d="M18 58V40l10-22h64l10 22v18z" />
      <path className="vs-ln" d="M30 38l7-15h46l7 15z" />
      <path className="vs-faint" d="M18 48h84M26 58v6M94 58v6" />
      <rect className="vs-hi" x="72" y="33" width="14" height="6" />
      <path className="vs-hi-ln" d="M96 22l-8 9" />
      <circle className="vs-hi-ln" cx="98" cy="19" r="3" />
    </svg>
  );
}

/** باب السائق مفتوح، والملصق على العمود خلفه */
function DoorPillarDrawing() {
  return (
    <svg viewBox="0 0 120 72" className="vin-spot-art" aria-hidden="true">
      <path className="vs-ln" d="M10 50V38l14-16h52l16 16h14v12z" />
      <path className="vs-ln" d="M58 22v28" />
      <circle className="vs-ln" cx="30" cy="52" r="7" />
      <circle className="vs-ln" cx="92" cy="52" r="7" />
      <path className="vs-ln" d="M58 22l-22 4v22l22-2" />
      <rect className="vs-hi" x="60" y="30" width="8" height="12" />
    </svg>
  );
}

const SPOTS = [
  {
    title: "الاستمارة (رخصة سير المركبة)",
    body: "في حقل «رقم الهيكل» — وهذه أسهل طريقة: انسخه منها.",
    art: <FormCardDrawing />,
  },
  {
    title: "أسفل الزجاج الأمامي من جهة السائق",
    body: "تقرؤه من خارج السيارة.",
    art: <WindshieldDrawing />,
  },
  {
    title: "ملصق على عمود باب السائق",
    body: "يظهر حين تفتح الباب.",
    art: <DoorPillarDrawing />,
  },
];

export function VinLocations() {
  return (
    <>
      <ol className="vin-spots">
        {SPOTS.map((spot, i) => (
          <li key={spot.title}>
            <span className="callout">{i + 1}</span>
            <div className="vin-spot-text">
              <strong>{spot.title}</strong>
              <span>{spot.body}</span>
            </div>
            {spot.art}
          </li>
        ))}
      </ol>
      <p className="hint">
        ١٧ خانة من حروف إنجليزية وأرقام، وليس فيه الأحرف «<span className="t-data">I</span>» و«
        <span className="t-data">O</span>» و«<span className="t-data">Q</span>».
      </p>
    </>
  );
}
