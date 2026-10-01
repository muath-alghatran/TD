import { Icon } from "@/components/ui/Icon";
import { visibleFaq, type FaqItem } from "@/lib/faq";
import { HELLO_MESSAGE, buildWhatsAppLink } from "@/lib/whatsapp-requests";

/**
 * قائمة أسئلة قابلة للطي — هنا وفي صفحات الباقات. details/summary يعمل بلا
 * JavaScript وبلوحة المفاتيح، والسؤال الأول مفتوح.
 */
export function FaqList({ items }: { items: Pick<FaqItem, "id" | "q" | "a">[] }) {
  return (
    <div className="faq">
      {items.map((item, i) => (
        <details key={item.id} className="faq-item" open={i === 0}>
          <summary>
            <span className="faq-q">{item.q}</span>
            <Icon name="chevronDown" size={20} className="faq-chev" />
          </summary>
          <p className="faq-a">{item.a}</p>
        </details>
      ))}
    </div>
  );
}

/** «أسئلة ممكن تخطر في بالك» — في الرئيسية وصفحة الدعم */
export function FaqSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="faq-title">
      <h2 id="faq-title" className="sec-title">
        أسئلة ممكن تخطر في بالك
      </h2>
      <FaqList items={visibleFaq()} />
      <p className="faq-more">
        عندك سؤال ثاني؟
        <a href={buildWhatsAppLink(HELLO_MESSAGE)} target="_blank" rel="noopener noreferrer" className="sec-link">
          اسألنا على واتساب
          <Icon name="chevronLeft" size={15} />
        </a>
      </p>
    </section>
  );
}
