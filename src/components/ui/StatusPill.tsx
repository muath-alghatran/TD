export type PromiseStatus = "ok" | "wait" | "spec";

const DEFAULT_LABEL: Record<PromiseStatus, string> = {
  ok: "متوفر ومؤكد",
  wait: "يحتاج تأكيد",
  spec: "طلب خاص",
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: PromiseStatus;
  label?: string;
  className?: string;
}) {
  return (
    <span className={`stat ${status} ${className ?? ""}`}>
      <i />
      {label ?? DEFAULT_LABEL[status]}
    </span>
  );
}
