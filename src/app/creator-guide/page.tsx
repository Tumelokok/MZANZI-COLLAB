import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const metadata: Metadata = {
  title: "FIZA’s first brand deal & creator guide | Mzansi Collab",
  description: "FIZA reflects on his first US$300 Temu collaboration. A practical guide to getting noticed, approaching brands and preparing to negotiate your rate.",
};

const quoteItems = [
  ["The work", "How many videos or photos? Which formats, lengths and platforms? Include planning, filming, editing and agreed revisions."],
  ["Where it can appear", "Separate posting on your own channels from the brand reposting content or running it as an advert. Agree the channels and duration."],
  ["What it limits", "Ask whether the brand expects exclusivity. Define the category, competing brands and time period before pricing that commitment."],
  ["The practical details", "Account for production costs, travel, turnaround and extra edits. Confirm payment timing and what happens when the brief changes."],
];

export default function CreatorGuidePage() {
  return <><SiteHeader /><main className="creator-guide">
    <header className="guide-heading detail-shell">
      <p className="eyebrow eyebrow-dark">Creator notes / 01 · FIZA</p>
      <h1>The first yes is exciting.<br /><em>Know what comes next.</em></h1>
      <p>A first brand collaboration, a US$300 fee, and a lesson in speaking up about the value of your work.</p>
      <nav className="guide-jump" aria-label="In this guide">
        <a href="#first-deal">FIZA’s story</a><a href="#get-noticed">Get noticed</a><a href="#pitch">Approach a brand</a><a href="#negotiate">Negotiate your rate</a>
      </nav>
    </header>
    <section className="guide-story detail-shell" id="first-deal">
      <figure className="fiza-portrait guide-portrait">
        <Image src="/images/fiza-founder.jpg" alt="FIZA sharing his perspective as a South African creator" fill priority sizes="(max-width: 800px) 90vw, 35vw" />
        <figcaption><strong>FIZA</strong><span>Content creator · Founder</span></figcaption>
      </figure>
      <div>
        <p className="eyebrow eyebrow-dark">In FIZA’s words</p>
        <h2>US$300. A first opportunity.<br />A lesson to carry forward.</h2>
        <blockquote>
          <p>My first brand collaboration was with Temu. They paid me US$300. At the time, that felt like a lot of money. It was my first time receiving that much, and I was excited to work with such a big company.</p>
          <p>Looking back, I feel I didn’t negotiate enough. I wish I had been more confident in discussing what I wanted to be paid.</p>
          <p>I’m sharing this to encourage other creators to prepare for that conversation. It isn’t about criticising Temu. It’s about learning from my first experience and helping someone else negotiate with more confidence.</p>
        </blockquote>
        <p className="story-note">FIZA’s personal reflection, edited for clarity. US$300 was his first-deal fee, not a recommended rate or a market benchmark.</p>
      </div>
    </section>
    <div className="guide-divider detail-shell"><span>Take the lesson into your next conversation</span><p>A practical Mzansi Collab guide for creators preparing to work with brands.</p></div>
    <section className="guide-chapter detail-shell" id="get-noticed">
      <div><p className="eyebrow eyebrow-dark">01 / Get noticed</p><h2>Make your value<br />easy to recognise.</h2><p>Choose a few strong examples that show your voice and the kind of work you want to create. Make your contact details easy to find, and give a brand a clear reason to see a fit.</p><ul><li>Build a concise portfolio with relevant examples.</li><li>Prepare a media kit with current audience information and honest results.</li><li>Label self-initiated concepts so they are not mistaken for paid campaigns.</li></ul><a className="guide-source" href="https://support.google.com/youtube/answer/12928947?hl=en">Further reading: YouTube’s brand-deal tips ↗</a></div>
      <figure><Image src="/images/solo-food.png" alt="Illustrative food creator carefully photographing his work" width={1448} height={1086} sizes="(max-width: 800px) 90vw, 45vw" /><figcaption>Original AI-generated illustration · one creator, a distinct point of view.</figcaption></figure>
    </section>
    <section className="guide-pitch" id="pitch"><div className="detail-shell guide-chapter">
      <div><p className="eyebrow">02 / Approach a brand</p><h2>Lead with an idea<br /><em>they can picture.</em></h2><p>Find the relevant marketing contact or the brand’s stated collaboration channel. Keep the introduction specific: who you reach, why the brand fits and what you would make.</p><p>Share a relevant example, then ask about their campaign goals, budget and timing. You are opening a conversation.</p></div>
      <div className="pitch-example"><span>Example pitch · adapt it to your work</span><p>Hi [name], I’m [creator], a South African [niche] creator. I have an idea for [specific concept] that connects [brand/product] with [audience interest].</p><p>Here’s a relevant example: [portfolio link]. Are you planning any paid creator collaborations for [period]? I’d love to learn about the brief and budget.</p></div>
    </div></section>
    <section className="guide-rates detail-shell" id="negotiate">
      <p className="eyebrow eyebrow-dark">03 / Negotiate your rate</p><h2>Price the whole brief.<br /><em>Then have the conversation.</em></h2><p className="guide-lead">Before saying yes, understand what you are being asked to create, where it will be used and how much time it will take. Your first offer does not have to be your final agreement.</p>
      <div className="rate-grid">{quoteItems.map(([title,text], index)=><article key={title}><span>0{index+1}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      <div className="negotiation-example"><div><h3>If the budget is lower,<br />discuss the scope.</h3><p>Offer a smaller package, fewer deliverables or a shorter usage period if that works for you. Put the agreed fee, scope and timing in writing before starting.</p></div><div><span>Example counteroffer · fill in your own figures</span><blockquote>“For [deliverables] with [usage period] and [revision limit], my fee is R[amount]. If your budget is R[budget], I can offer [reduced scope]. Which option would work best?”</blockquote><small>Illustrative wording. Set your own fee; FIZA’s first-deal amount is not a pricing template.</small></div></div>
      <p className="guide-source">Further reading: <a href="https://www.shopify.com/blog/influencer-pricing">Shopify’s guide to pricing, usage and exclusivity ↗</a></p>
    </section>
    <section className="guide-end detail-shell"><h2>Your next deal can start<br />with a better conversation.</h2><Link className="button button-dark" href="/community">Explore the creator community →</Link></section>
  </main><SiteFooter /></>;
}
