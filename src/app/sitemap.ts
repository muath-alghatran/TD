import type { MetadataRoute } from "next";
import { PACKAGES } from "@/lib/packages";

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

  const packageUrls: MetadataRoute.Sitemap = PACKAGES.map((p) => ({
    url: `${BASE_URL}/packages/${p.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // صفحات قطع كامري التجريبية سُحبت في المرحلة 5 — /parts/<رقم> تتحول إلى /parts
  return [...pages, ...packageUrls];
}
