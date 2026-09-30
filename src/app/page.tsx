import { ActiveOrder } from "@/components/home/ActiveOrder";
import { GaragePeek } from "@/components/home/GaragePeek";
import { HomeHero } from "@/components/home/HomeHero";
import { IdentityStrip } from "@/components/home/IdentityStrip";
import { PromisesRail } from "@/components/home/PromisesRail";
import { ServicesBoard } from "@/components/home/ServicesBoard";
import { TabBar } from "@/components/shell/TabBar";

/**
 * الرئيسية — تجمع الاتجاهات الثلاثة (docs/design/README.md):
 * واجهة المركز (1c) · الطلب النشط على الطريق (1b) · لوح الخدمات الست (1a) ·
 * كراجي باللوحة السعودية ووعودنا على الطريق (1b) · شريط الهوية (1a).
 */
export default function HomePage() {
  return (
    <>
      <main className="screen has-tabbar">
        <HomeHero />
        <ActiveOrder />
        <ServicesBoard />
        <GaragePeek />
        <PromisesRail />
        <IdentityStrip />
      </main>
      <TabBar />
    </>
  );
}
