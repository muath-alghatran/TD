import type { Metadata } from "next";
import { TowForm } from "@/components/requests/TowForm";
import { AppBar } from "@/components/shell/AppBar";

export const metadata: Metadata = { title: "طلب سطحة" };

export default function TowPage() {
  return (
    <>
      <AppBar title="طلب سطحة" />
      <TowForm />
    </>
  );
}
