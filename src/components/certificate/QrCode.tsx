import QRCode from "qrcode";

/**
 * رمز QR كـSVG مرسوم من مصفوفة المكتبة — بلا صورة ولا خدمة خارجية، ويُطبع حاداً في الـPDF.
 * الوحدات داكنة على مربع فاتح ثابت في الوضعين: الماسحات تتعثر في الرمز المقلوب.
 */
export function QrCode({ value, size = 112, label }: { value: string; size?: number; label: string }) {
  const qr = QRCode.create(value, { errorCorrectionLevel: "M" });
  const n = qr.modules.size;
  const quiet = 2;
  let d = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (qr.modules.data[y * n + x]) d += `M${x + quiet} ${y + quiet}h1v1h-1z`;
    }
  }
  const box = n + quiet * 2;
  return (
    <svg className="qr" viewBox={`0 0 ${box} ${box}`} width={size} height={size} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={box} height={box} fill="var(--n-100)" />
      <path d={d} fill="var(--n-900)" />
    </svg>
  );
}
