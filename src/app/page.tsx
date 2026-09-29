"use client";

import { useState } from "react";
import { BottomNav, type NavTarget } from "@/components/dashboard/BottomNav";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { getGaragedVehicles, type GaragedVehicle } from "@/lib/garage";
import { PartsOrderFlow } from "@/components/vehicle/PartsOrderFlow";

function mostRecentVehicle(): GaragedVehicle | undefined {
  const saved = getGaragedVehicles();
  return saved.length > 0 ? saved[saved.length - 1] : undefined;
}

export default function Home() {
  const [screen, setScreen] = useState<NavTarget>("home");
  const [partsKey, setPartsKey] = useState(0);

  function openParts() {
    setPartsKey((k) => k + 1);
    setScreen("parts");
  }

  return (
    <>
      {screen === "home" && <Dashboard onOpenParts={openParts} />}
      {screen === "parts" && (
        <PartsOrderFlow key={partsKey} initialVehicle={mostRecentVehicle()} onHome={() => setScreen("home")} />
      )}
      <BottomNav active={screen} onNavigate={(target) => (target === "parts" ? openParts() : setScreen("home"))} />
    </>
  );
}
