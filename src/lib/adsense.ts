export const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-6686161902100366";

export const ADSENSE_SLOTS = {
  guide: process.env.NEXT_PUBLIC_ADSENSE_GUIDE_SLOT,
  converter: process.env.NEXT_PUBLIC_ADSENSE_CONVERTER_SLOT,
} as const;
