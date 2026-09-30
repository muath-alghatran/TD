import { Corners } from "@/components/ui/Corners";
import { Icon, type IconName } from "@/components/ui/Icon";

const PROMISES: { icon: IconName; text: string }[] = [
  { icon: "receipt", text: "تعرف السعر مفصّلًا قبل أي عمل" },
  { icon: "check", text: "لا نبدأ إلا بموافقتك" },
  { icon: "camera", text: "تتابع سيارتك بالصور والفيديو من الورشة" },
  { icon: "scrollText", text: "ضمان واحد مكتوب يشمل القطع والتركيب" },
  { icon: "truck", text: "سطحة مجانية عند موافقتك على السعر" },
];

/** وعودنا على الطريق (1b): بطاقات تمرّ أفقياً */
export function PromisesRail() {
  return (
    <section className="page" aria-labelledby="promises-title">
      <h2 id="promises-title" className="sec-title" style={{ marginTop: 32 }}>
        وعودنا على الطريق
      </h2>
      <ul className="rail">
        {PROMISES.map((p) => (
          <li key={p.text} className="blueprint promise-card">
            <Corners />
            <Icon name={p.icon} size={22} />
            <div>{p.text}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
