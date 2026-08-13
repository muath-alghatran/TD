const COLUMNS = "ABCDEFGH".split("");
const ROWS = [1, 2, 3, 4];

/** مسطرة إحداثيات A–H × 1–4 حول مخطط SVG — منسوخة من IIFE الخاص بـ ruler() في النموذج. */
export function Ruler() {
  return (
    <g className="ruler">
      {COLUMNS.map((letter, i) => (
        <text key={letter} x={76 + i * 104} y={392}>
          {letter}
        </text>
      ))}
      {ROWS.map((n, i) => (
        <text key={n} x={18} y={112 + i * 76}>
          {n}
        </text>
      ))}
    </g>
  );
}
