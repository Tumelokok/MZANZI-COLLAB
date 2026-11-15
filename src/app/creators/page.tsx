import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { FizaFeature } from "@/components/fiza-feature";
import { CreatorCommunity } from "@/components/creator-community";

export const metadata: Metadata = {
  title: "For creators | Mzansi Collab",
  description:
    "Build a professional creative presence, show your work and prepare for meaningful brand opportunities with Mzansi Collab.",
};

const tools = [
  ["01", "A profile that feels like you", "Bring together your creative focus, social presence and best work in one professional home."],
  ["02", "A portfolio people can explore", "Show the work, formats and creative direction that make you the right fit for a brief."],
  ["03", "A clearer path to opportunities", "Discover relevant briefs and make more informed decisions about the collaborations you pursue."],
];

export default function CreatorsPage() {
  return (
    <><SiteHeader /><main className="detail-page creators-page">

      <section className="detail-hero detail-hero-image">
        <Image src="/images/solo-fashion.png" alt="Illustrative solo creator filming in a Johannesburg studio" fill priority sizes="100vw" className="detail-hero-photo" />
        <div className="detail-hero-overlay" />
        <div className="detail-hero-copy detail-shell"><p className="eyebrow"><span /> Mzansi Collab for creators</p><h1>Bring your creative work <em>into the room.</em></h1><p>From content creators and musicians to photographers, models and producers — Mzansi Collab is being built to help creative people present their value and find meaningful commercial opportunities.</p><div className="detail-actions"><Link className="button button-gold" href="/#get-started">I&apos;m ready to create <span aria-hidden="true">→</span></Link><Link className="button button-ghost" href="#creator-tools">See what&apos;s coming <span aria-hidden="true">↓</span></Link></div></div>
      </section>

      <CreatorCommunity />

      <section id="creator-tools" className="tool-section"><div className="detail-shell"><div className="section-title"><p className="eyebrow"><span /> Your creative foundation</p><h2>Show up with more than <em>just a link.</em></h2></div><div className="tool-grid">{tools.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

    <FizaFeature />

      <section className="video-section"><div className="detail-shell video-layout"><div><p className="eyebrow"><span /> Watch & learn</p><h2>Practical creative knowledge, <em>on screen.</em></h2><p>Mzansi Collab&apos;s future YouTube programme will bring creator conversations, campaign breakdowns and practical professional advice into one accessible learning library.</p><Link href="/community" className="text-link">Explore the community vision <span aria-hidden="true">→</span></Link></div><div className="video-placeholder"><span className="play-button" aria-hidden="true">▶</span><div><strong>Mzansi Collab presents</strong><p>Creator conversations, coming soon.</p></div><small>YouTube-ready video showcase</small></div></div></section>

      <section className="detail-cta"><div className="detail-shell"><p className="eyebrow"><span /> Make the next move</p><h2>Your creativity has a place in the <em>economy.</em></h2><p>Build your professional presence with Mzansi Collab as the platform takes shape.</p><Link className="button button-gold" href="/#get-started">Explore Mzansi Collab <span aria-hidden="true">→</span></Link></div></section>
    </main><SiteFooter /></>
  );
}
