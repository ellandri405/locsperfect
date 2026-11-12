import { ImageResponse } from "next/og";
import { site } from "@/data/site";

/** Aperçu affiché lors d'un partage du site (WhatsApp, Instagram, Facebook…). */
export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
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
          padding: 80,
          background: "linear-gradient(135deg, #1f5a43 0%, #0f3325 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 8 }}>{site.name}</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05, letterSpacing: -2 }}>Les locks, ton style.</div>
          <div style={{ display: "flex", fontSize: 84, lineHeight: 1.05, letterSpacing: -2, color: "#b5c7b5" }}>Ton identité.</div>
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#e9f0e9" }}>
          Départ de locks · Locks temporaires · Achat de locks — {site.city}
        </div>
      </div>
    ),
    size,
  );
}
