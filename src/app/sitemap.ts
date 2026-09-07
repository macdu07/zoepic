import { MetadataRoute } from "next";
import { guides } from "@/content/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    {
      url: "https://zoepic.online",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    { url: "https://zoepic.online/convert", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://zoepic.online/guias", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://zoepic.online/sobre-zoepic", lastModified: new Date(), changeFrequency: "yearly", priority: 0.5 },
    { url: "https://zoepic.online/contacto", lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
    { url: "https://zoepic.online/terminos", lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    {
      url: "https://zoepic.online/politica-de-privacidad",
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
  return [...pages, ...guides.map((guide) => ({ url: `https://zoepic.online/guias/${guide.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.7 }))];
}
