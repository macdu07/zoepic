export const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID || "ca-pub-6686161902100366";

// Keep monetization off until the publisher has verified the ID, published
// the Google consent message and tested the resulting ad requests.
export const ADSENSE_ENABLED = process.env.NEXT_PUBLIC_ADSENSE_ENABLED === "true";
export const GOOGLE_CMP_ENABLED = process.env.NEXT_PUBLIC_GOOGLE_CMP_ENABLED === "true";

export const ADSENSE_SLOTS = {
  guide: process.env.NEXT_PUBLIC_ADSENSE_GUIDE_SLOT,
  converter: process.env.NEXT_PUBLIC_ADSENSE_CONVERTER_SLOT,
} as const;
