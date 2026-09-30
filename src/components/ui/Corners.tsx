/**
 * علامات التسجيل «+» الأربع خارج زوايا الإطار — تُوضع داخل أي عنصر يحمل الصنف
 * "blueprint" (بطاقة، زر، صورة). الشكل في globals.css (.blueprint > .corner).
 */
export function Corners() {
  return (
    <>
      <i className="corner tl" aria-hidden="true" />
      <i className="corner tr" aria-hidden="true" />
      <i className="corner bl" aria-hidden="true" />
      <i className="corner br" aria-hidden="true" />
    </>
  );
}
