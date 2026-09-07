import type { MetadataRoute } from "next";
import { guides } from "@/content/guides";
import { CONTENT_LAST_MODIFIED, SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(CONTENT_LAST_MODIFIED);
  const pages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    { url: `${SITE_URL}/convert`, lastModified, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/guias`, lastModified, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/sobre-zoepic`, lastModified, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/contacto`, lastModified, changeFrequency: "yearly", priority: 0.4 },
    { url: `${SITE_URL}/terminos`, lastModified, changeFrequency: "yearly", priority: 0.3 },
    {
      url: `${SITE_URL}/politica-de-privacidad`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
  return [
    ...pages,
    ...guides.map((guide) => ({
      url: `${SITE_URL}/guias/${guide.slug}`,
      lastModified: new Date(guide.dateModified),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
