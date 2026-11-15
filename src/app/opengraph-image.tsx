import { ImageResponse } from "next/og";
import { brandDataUrl } from "@/lib/brand-image";
export const alt = "Mzansi Collab — Creators. Brands. Opportunities.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default async function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#0d0e11", color: "white", alignItems: "center", padding: 70, gap: 60 }}>
      <div style={{ width: 340, height: 340, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
        <img src={await brandDataUrl()} alt="" width={380} height={389} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={{ color: "#a8f96c", fontSize: 19, letterSpacing: 4 }}>SOUTH AFRICA’S CREATIVE COMMUNITY</span>
        <span style={{ fontSize: 78, fontWeight: 700, marginTop: 28, lineHeight: 1.05 }}>MZANSI</span>
        <span style={{ fontSize: 58, letterSpacing: 10, color: "#39b4f4" }}>COLLAB</span>
        <span style={{ fontSize: 25, color: "#d3d3d3", marginTop: 30 }}>Creators. Brands. Opportunities.</span>
      </div>
    </div>,
    size,
  );
}
