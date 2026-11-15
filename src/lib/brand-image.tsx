import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export async function brandDataUrl() {
  const logo = await readFile(join(process.cwd(), "public/branding/mzansi-c-transparent.png"));
  return `data:image/png;base64,${logo.toString("base64")}`;
}

export async function brandIcon(size: number) {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={await brandDataUrl()} alt="" width={size * 1.15} height={size * 1.15 * 1268 / 1240} style={{ flexShrink: 0 }} />
    </div>,
    { width: size, height: size },
  );
}
