import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #14072B 0%, #2E1065 55%, #7C3AED 100%)",
          color: "#F5F3FF",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 22px",
              borderRadius: "999px",
              background: "#F5B83D",
              color: "#14072B",
              fontSize: "24px",
              fontWeight: 800,
            }}
          >
            Curadoria diária de ofertas
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "78px",
              fontWeight: 900,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {SITE_CONFIG.name}
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "#C4B5FD",
              maxWidth: "900px",
              lineHeight: 1.35,
            }}
          >
            {SITE_CONFIG.tagline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(196, 181, 253, 0.25)",
            paddingTop: "28px",
            fontSize: "24px",
            color: "#C4B5FD",
          }}
        >
          <span>Shopee • Mercado Livre • Amazon</span>
          <span style={{ color: "#F5B83D", fontWeight: 700 }}>
            Ofertas verificadas todos os dias
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
