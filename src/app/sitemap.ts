import type { MetadataRoute } from "next";
import { ZONES } from "@/lib/zone-catalog";

// TODO(نطاق حقيقي): اضبط NEXT_PUBLIC_SITE_URL في بيئة الإنتاج قبل النشر.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** الصفحات العامة فقط — «طلباتي» و«كراجي» خاصة بمتصفح كل عميل فلا تُفهرس */
const PUBLIC_PAGES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "", priority: 1, changeFrequency: "daily" },
  { path: "/parts", priority: 0.9, changeFrequency: "daily" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/booking", priority: 0.7, changeFrequency: "monthly" },
  { path: "/tow", priority: 0.7, changeFrequency: "monthly" },
  { path: "/support", priority: 0.6, changeFrequency: "monthly" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = PUBLIC_PAGES.map((page) => ({
    url: `${BASE_URL}${page.path}`,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }));

  const partUrls: MetadataRoute.Sitemap = ZONES.flatMap((zone) => zone.parts)
    .filter((p) => p.avail !== false)
    .map((p) => ({
      url: `${BASE_URL}/parts/${p.oem}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [...pages, ...partUrls];
}
