import { Icon } from "@/components/ui/Icon";
import { visibleFaq } from "@/lib/faq";
import { HELLO_MESSAGE, buildWhatsAppLink } from "@/lib/whatsapp-requests";

/**
 * «أسئلة ممكن تخطر في بالك» — في الرئيسية وصفحة الدعم. details/summary يعمل بلا
 * JavaScript وبلوحة المفاتيح، والسؤال الأول مفتوح.
 */
export function FaqSection({ className }: { className?: string }) {
  return (
    <section className={className} aria-labelledby="faq-title">
      <h2 id="faq-title" className="sec-title">
        أسئلة ممكن تخطر في بالك
      </h2>
      <div className="faq">
        {visibleFaq().map((item, i) => (
          <details key={item.id} className="faq-item" open={i === 0}>
            <summary>
              <span className="faq-q">{item.q}</span>
              <Icon name="chevronDown" size={20} className="faq-chev" />
            </summary>
            <p className="faq-a">{item.a}</p>
          </details>
        ))}
      </div>
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
