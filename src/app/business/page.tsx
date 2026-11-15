import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { BrandCarousel } from "@/components/brand-carousel";

export const metadata: Metadata = {
  title: "For businesses | Mzansi Collab",
  description:
    "Discover creative talent, review their work and prepare better collaborations with Mzansi Collab.",
};

const steps = [
  ["01", "Start with the work", "Move from broad audience numbers to the creative skills, style and portfolio evidence that make a collaborator right for your brief."],
  ["02", "Meet the right talent", "Explore diverse creative disciplines, from UGC and social content to photography, music, video and performance."],
  ["03", "Work with better context", "Build clearer briefs, decisions and collaboration expectations as the marketplace develops."],
];

export default function BusinessPage() {
  return (
    <><SiteHeader /><main className="detail-page business-page">

      <section className="detail-hero detail-hero-image business-hero">
        <div className="business-hero-visual"><Image src="/images/business-diverse-duo.png" alt="Illustrative white South African brand manager and Black content creator planning a collaboration" fill priority sizes="100vw" className="detail-hero-photo business-hero-photo" /></div>
        <div className="detail-hero-overlay business-hero-overlay" />
        <div className="detail-hero-copy detail-shell business-hero-copy"><p className="eyebrow"><span /> Mzansi Collab for businesses</p><h1>Find the people who can make your brief <em>matter.</em></h1><p>Mzansi Collab will bring businesses closer to South Africa&apos;s creative talent — with stronger context, better discovery and a more thoughtful path from idea to collaboration.</p><div className="detail-actions"><Link className="button button-gold" href="/signup?role=business">I&apos;m building a brand <span aria-hidden="true">→</span></Link><Link className="button button-ghost" href="#business-tools">Explore the approach <span aria-hidden="true">↓</span></Link></div></div>
      </section>

      <section className="detail-intro detail-shell"><p className="eyebrow eyebrow-dark"><span /> Build beyond the brief</p><div><h2>Creative discovery should feel <em>considered.</em></h2><p>Finding the right collaborator is about much more than reach. It is about a shared point of view, relevant skills and a practical way to build work together.</p></div></section>

      <section id="business-tools" className="tool-section business-tools"><div className="detail-shell"><div className="section-title"><p className="eyebrow"><span /> A better way to find fit</p><h2>From idea to collaboration, <em>with more clarity.</em></h2></div><div className="tool-grid">{steps.map(([number, title, text]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <BrandCarousel />

      <section className="video-section business-video"><div className="detail-shell video-layout"><div className="video-placeholder business-video-placeholder"><span className="play-button" aria-hidden="true">▶</span><div><strong>Mzansi Collab presents</strong><p>Campaign stories, coming soon.</p></div><small>YouTube-ready video showcase</small></div><div><p className="eyebrow"><span /> Learn from the work</p><h2>Campaign ideas are better when they are <em>shared.</em></h2><p>We&apos;re building a future video library around better briefing, creative collaboration and the people who make standout work happen.</p><Link href="/community" className="text-link light-text-link">Explore the community vision <span aria-hidden="true">→</span></Link></div></div></section>

      <section className="detail-cta"><div className="detail-shell"><p className="eyebrow"><span /> Make the next move</p><h2>Find creative work that moves your <em>brand forward.</em></h2><p>Join the Mzansi Collab journey as we build a more connected creative economy.</p><Link className="button button-gold" href="/signup?role=business">Explore Mzansi Collab <span aria-hidden="true">→</span></Link></div></section>
    </main><SiteFooter /></>
  );
}
