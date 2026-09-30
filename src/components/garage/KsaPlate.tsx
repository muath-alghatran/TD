import { parseSaudiPlate } from "@/lib/saudi-plate";

/** اللوحة السعودية (1b): الأرقام يساراً، والحروف يميناً، والعربي فوق اللاتيني */
export function KsaPlate({ plate }: { plate: string | null | undefined }) {
  const parsed = parseSaudiPlate(plate);
  if (!parsed) return null;
  const spoken = `${[...parsed.lettersAr].reverse().join(" ")} ${parsed.digitsAr}`;
  return (
    <div className="ksa-plate" role="img" aria-label={`اللوحة ${spoken}`}>
      <div>
        <span>{parsed.digitsAr}</span>
        <span>{parsed.digitsEn}</span>
      </div>
      <div>
        <span>
          {parsed.lettersAr.map((ch, i) => (
            <b key={i}>{ch}</b>
          ))}
        </span>
        <span>
          {parsed.lettersEn.map((ch, i) => (
            <b key={i}>{ch}</b>
          ))}
        </span>
      </div>
      <div className="ksa">KSA</div>
    </div>
  );
}
