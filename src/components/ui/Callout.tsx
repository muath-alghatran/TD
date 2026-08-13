export function Callout({ n, gap }: { n: number; gap?: boolean }) {
  return <span className={`callout ${gap ? "gap" : ""}`}>{n}</span>;
}
