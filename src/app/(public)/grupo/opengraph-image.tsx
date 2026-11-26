import { ImageResponse } from "next/og";
import { SITE_CONFIG } from "@/lib/config";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";
export const alt = `Grupo VIP no WhatsApp - ${SITE_CONFIG.name}`;

export default function GrupoOpenGraphImage() {
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
            gap: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "10px 24px",
              borderRadius: "999px",
              backgroundColor: "#25D366",
              color: "#04361A",
              fontSize: "24px",
              fontWeight: 700,
            }}
          >
            Grupo VIP no WhatsApp
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div
            style={{
              fontSize: "68px",
              fontWeight: 600,
              letterSpacing: "-0.01em",
              lineHeight: 1.08,
            }}
          >
            {SITE_CONFIG.name}
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "#C9BEDC",
              lineHeight: 1.35,
              maxWidth: "920px",
            }}
          >
            Entre no grupo para receber os achados selecionados direto no
            celular.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "24px",
            color: "#A9D8B8",
            fontWeight: 600,
          }}
        >
          <span>Curadoria diária · Toque para entrar no grupo</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
