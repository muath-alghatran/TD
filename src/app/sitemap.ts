import type { MetadataRoute } from "next";
import { ZONES } from "@/lib/zone-catalog";

// TODO(نطاق حقيقي): اضبط NEXT_PUBLIC_SITE_URL في بيئة الإنتاج قبل النشر.
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const partUrls: MetadataRoute.Sitemap = ZONES.flatMap((zone) => zone.parts)
    .filter((p) => p.avail !== false)
    .map((p) => ({
      url: `${BASE_URL}/parts/${p.oem}`,
      changeFrequency: "weekly",
      priority: 0.7,
    }));

  return [{ url: BASE_URL, changeFrequency: "daily", priority: 1 }, ...partUrls];
}
