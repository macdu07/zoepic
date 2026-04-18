import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ZoePic — Convierte imágenes a WebP con IA";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f1117 0%, #1a2535 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "36px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              background: "#7daf4b",
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "42px",
            }}
          >
            🖼️
          </div>
          <span
            style={{ fontSize: "52px", fontWeight: "800", color: "#ffffff" }}
          >
            ZoePic
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "58px",
            fontWeight: "800",
            color: "#ffffff",
            textAlign: "center",
            margin: "0 0 20px 0",
            lineHeight: 1.1,
          }}
        >
          Convierte a WebP y
          <br />
          <span style={{ color: "#7daf4b" }}>renombra con IA</span>
        </h1>

        {/* Subtext */}
        <p
          style={{
            fontSize: "26px",
            color: "#94a3b8",
            textAlign: "center",
            margin: "0 0 40px 0",
            maxWidth: "820px",
          }}
        >
          Optimiza tus imágenes y mejora tu SEO automáticamente
        </p>

        {/* Badge */}
        <div
          style={{
            background: "#7daf4b",
            color: "#ffffff",
            padding: "14px 36px",
            borderRadius: "50px",
            fontSize: "22px",
            fontWeight: "700",
          }}
        >
          Gratis para empezar · zoepic.online
        </div>
      </div>
    ),
    { ...size }
  );
}
