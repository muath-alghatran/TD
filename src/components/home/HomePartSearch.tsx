import { Corners } from "@/components/ui/Corners";

/**
 * حقل بحث القطع البارز في الرئيسية (المرحلة 5). نموذج عادي إلى ‎/parts?q=…‎ — يعمل بلا
 * JavaScript، وصفحة القطع تطلب تحديد السيارة أولاً إن لم تُحدَّد ثم تعرض النتائج.
 */
export function HomePartSearch() {
  return (
    <section className="page home-search" aria-labelledby="home-search-title">
      <form action="/parts" method="get" role="search" className="hsearch">
        <label id="home-search-title" htmlFor="home-part-q" className="hsearch-title">
          وش القطعة اللي تدوّرها؟
        </label>
        <div className="hsearch-row">
          <input
            id="home-part-q"
            name="q"
            type="search"
            className="input"
            placeholder="مثل: قماش، رديتر، كمبروسر"
            autoComplete="off"
            enterKeyHint="search"
            maxLength={80}
            required
          />
          <button type="submit" className="btn btn-primary blueprint">
            <Corners />
            ابحث
          </button>
        </div>
        <p className="hint">لكل الماركات · بالاسم الذي تعرفه · أسعار استرشادية تُثبَّت عند التأكيد</p>
      </form>
    </section>
  );
}
