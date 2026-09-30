import type { Metadata } from "next";
import { GarageScreen } from "@/components/garage/GarageScreen";
import { TabBar } from "@/components/shell/TabBar";
import { TabHead } from "@/components/shell/TabHead";

export const metadata: Metadata = { title: "كراجي" };

export default function GaragePage() {
  return (
    <>
      <main className="screen has-tabbar">
        <TabHead title="كراجي" code="MY GARAGE">
          مركباتك المحفوظة من الاستمارة — لا نسألك عنها مرة ثانية.
        </TabHead>
        <div className="page">
          <GarageScreen />
        </div>
      </main>
      <TabBar />
    </>
  );
}
