import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./community.css";
import "./creator-guide.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: "Mzansi Collab | Creators. Brands. Opportunities.",
  description:
    "Mzansi's creative economy, connected. Discover a more professional way for creators and businesses to collaborate.",
  keywords: [
    "South African creators",
    "creator economy",
    "influencer marketing",
    "creative collaboration",
    "Mzansi Collab",
  ],
  openGraph: {
    title: "Mzansi Collab | Creators. Brands. Opportunities.",
    description: "Mzansi's creative economy, connected.",
    images: [
      {
        url: "/branding/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mzansi Collab",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mzansi Collab | Creators. Brands. Opportunities.",
    description: "Mzansi's creative economy, connected.",
    images: ["/branding/og-image.png"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-ZA"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
