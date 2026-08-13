type Position = "tl" | "tr" | "bl" | "br";

const POSITION_CLASS: Record<Position, string> = {
  tl: "rm-tl",
  tr: "rm-tr",
  bl: "rm-bl",
  br: "rm-br",
};

export function RegMark({ position }: { position: Position }) {
  return <i className={`regmark ${POSITION_CLASS[position]}`} aria-hidden="true" />;
}
