import { FaceliftPackages } from "@/components/home/FaceliftPackages";
import { FaqSection } from "@/components/home/FaqSection";
import { GaragePeek } from "@/components/home/GaragePeek";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeJourneySlot } from "@/components/home/HomeJourneySlot";
import { HomePartSearch } from "@/components/home/HomePartSearch";
import { IdentityStrip } from "@/components/home/IdentityStrip";
import { PromisesRail } from "@/components/home/PromisesRail";
import { ServicesBoard } from "@/components/home/ServicesBoard";
import { TabBar } from "@/components/shell/TabBar";

/**
 * الرئيسية — تجمع الاتجاهات الثلاثة (docs/design/README.md):
 * واجهة المركز (1c) · بحث القطع · الطريق: رحلة الزائر أو طلبه النشط (1b) · لوح الخدمات الست (1a) ·
 * كراجي باللوحة السعودية · باقات الترهيم · وعودنا على الطريق (1b) · أسئلة ممكن تخطر في بالك ·
 * شريط الهوية (1a).
 */
export default function HomePage() {
  return (
    <>
      <main className="screen has-tabbar">
        <HomeHero />
        <HomePartSearch />
        <HomeJourneySlot />
        <ServicesBoard />
        <GaragePeek />
        <FaceliftPackages />
        <PromisesRail />
        <FaqSection className="page faq-sec" />
        <IdentityStrip />
      </main>
      <TabBar />
    </>
  );
}
