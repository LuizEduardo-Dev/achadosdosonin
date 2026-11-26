import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = `${SITE_CONFIG.name} - ${SITE_CONFIG.tagline}`;

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
          backgroundColor: "#180828",
          color: "#F3EFF8",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "8px 20px",
              borderRadius: "999px",
              border: "2px solid #A9D8B8",
              color: "#A9D8B8",
              fontSize: "22px",
              fontWeight: 600,
            }}
          >
            Curadoria diária
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div
            style={{
              fontSize: "74px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.08,
            }}
          >
            {SITE_CONFIG.name}
          </div>
          <div
            style={{
              fontSize: "32px",
              color: "#C9BEDC",
              maxWidth: "880px",
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
            borderTop: "2px solid #2B1347",
            paddingTop: "24px",
            fontSize: "22px",
            color: "#C9BEDC",
          }}
        >
          <span>Shopee · Mercado Livre · Amazon</span>
          <span style={{ color: "#A9D8B8", fontWeight: 600 }}>
            Ofertas selecionadas todos os dias
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
