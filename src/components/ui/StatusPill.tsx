import type { PromiseStatus } from "@/lib/promise-engine";

export type { PromiseStatus };

export const STATUS_LABEL: Record<PromiseStatus, string> = {
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
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}
