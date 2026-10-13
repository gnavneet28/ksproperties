import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { projects } from "@/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.8 },
    ...projects.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.3 },
  ];
}
