import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        port: "",
        pathname: "/**",
      },
    ],
    domains: ["placehold.co"],
  },
  serverExternalPackages: ["express", "genkit", "@genkit-ai/googleai", "sharp"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Evita que la app sea embedded en un iframe (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },
          // Evita MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Controla qué información de referrer se envía
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Deshabilita APIs del navegador que no se usan
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          // Protección XSS básica para browsers legacy
          { key: "X-XSS-Protection", value: "1; mode=block" },
        ],
      },
    ];
  },
};

export default nextConfig;

