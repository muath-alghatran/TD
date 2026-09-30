import type { MetadataRoute } from "next";
import { CENTER } from "@/lib/center-info";

/** يسمح بإضافة الموقع إلى الشاشة الرئيسية في الجوال كتطبيق */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${CENTER.nameAr} — ${CENTER.tagline}`,
    short_name: CENTER.nameAr,
    description: CENTER.summary,
    start_url: "/",
    display: "standalone",
    dir: "rtl",
    lang: "ar",
    background_color: "#f2f2f3",
    theme_color: "#1d2d3d",
    icons: [
      { src: "/icons/td-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/td-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
