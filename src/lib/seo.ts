export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://zoepic.online"
).replace(/\/$/, "");

export const SITE_NAME = "ZoePic";
export const SITE_DESCRIPTION =
  "Convierte imágenes JPG y PNG a WebP, ajusta dimensiones y prepara nombres claros para sitios web, tiendas y catálogos.";
export const SITE_LOGO_URL = `${SITE_URL}/icon.svg`;
export const SITE_IMAGE_URL = `${SITE_URL}/og-image.jpg`;
export const CONTENT_LAST_MODIFIED = "2026-09-06T00:00:00.000Z";

export interface FaqSchemaItem {
  question: string;
  answer: string;
}

export interface BreadcrumbSchemaItem {
  name: string;
  url: string;
}

export interface GuideSchemaInput {
  slug: string;
  title: string;
  description: string;
  datePublished: string;
  dateModified: string;
}

const ORGANIZATION_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const SOFTWARE_ID = `${SITE_URL}/#software`;

export function organizationSchema(): Record<string, unknown> {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: SITE_NAME,
    url: SITE_URL,
    logo: SITE_LOGO_URL,
    email: "privacy@zoepic.online",
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "privacy@zoepic.online",
      availableLanguage: "Spanish",
      url: `${SITE_URL}/contacto`,
    },
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es",
    publisher: { "@id": ORGANIZATION_ID },
  };
}

export function softwareApplicationSchema(url = `${SITE_URL}/convert`): Record<string, unknown> {
  return {
    "@type": "SoftwareApplication",
    "@id": SOFTWARE_ID,
    name: "Conversor WebP de ZoePic",
    url,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Web",
    description: SITE_DESCRIPTION,
    inLanguage: "es",
    featureList: [
      "Conversión por lotes a WebP",
      "Ajuste de dimensiones y recorte",
      "Renombrado opcional con inteligencia artificial",
    ],
    provider: { "@id": ORGANIZATION_ID },
    offers: [
      {
        "@type": "Offer",
        name: "Starter",
        price: "0.00",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/#pricing`,
        description: "100 conversiones WebP al día y lotes de hasta 5 imágenes.",
      },
      {
        "@type": "Offer",
        name: "Pro",
        price: "6.99",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "6.99",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/#pricing`,
        description: "Conversión WebP ilimitada y hasta 3.000 renombrados con IA al mes.",
      },
      {
        "@type": "Offer",
        name: "Agency",
        price: "23.99",
        priceCurrency: "USD",
        priceSpecification: {
          "@type": "UnitPriceSpecification",
          price: "23.99",
          priceCurrency: "USD",
          billingDuration: "P1M",
        },
        availability: "https://schema.org/InStock",
        url: `${SITE_URL}/#pricing`,
        description: "Conversión WebP ilimitada y hasta 20.000 renombrados con IA al mes.",
      },
    ],
  };
}

export function faqPageSchema(items: readonly FaqSchemaItem[]): Record<string, unknown> {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: readonly BreadcrumbSchemaItem[]): Record<string, unknown> {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function guideCollectionSchema(
  guides: readonly GuideSchemaInput[],
): Record<string, unknown> {
  return {
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/guias#collection`,
    name: "Guías de imágenes para la web",
    description: "Guías prácticas sobre WebP, calidad, dimensiones y nombres de archivo.",
    url: `${SITE_URL}/guias`,
    isPartOf: { "@id": WEBSITE_ID },
    publisher: { "@id": ORGANIZATION_ID },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: guides.map((guide, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: guide.title,
        url: `${SITE_URL}/guias/${guide.slug}`,
      })),
    },
  };
}

export function guideArticleSchema(guide: GuideSchemaInput): Record<string, unknown> {
  const url = `${SITE_URL}/guias/${guide.slug}`;
  return {
    "@type": "Article",
    "@id": `${url}#article`,
    headline: guide.title,
    description: guide.description,
    image: SITE_IMAGE_URL,
    url,
    mainEntityOfPage: url,
    articleSection: "Guías de imágenes para la web",
    inLanguage: "es",
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
    author: { "@id": ORGANIZATION_ID },
    publisher: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function aboutPageSchema(): Record<string, unknown> {
  return {
    "@type": "AboutPage",
    "@id": `${SITE_URL}/sobre-zoepic#about`,
    name: "Sobre ZoePic",
    description: "Qué hace ZoePic y cómo procesa las imágenes.",
    url: `${SITE_URL}/sobre-zoepic`,
    about: { "@id": ORGANIZATION_ID },
    isPartOf: { "@id": WEBSITE_ID },
  };
}

export function homepageSchema(items: readonly FaqSchemaItem[]): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      softwareApplicationSchema(SITE_URL),
      faqPageSchema(items),
    ],
  };
}
