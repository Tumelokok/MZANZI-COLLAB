import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { CreatorCommunity } from "@/components/creator-community";

export const metadata: Metadata = { title: "Creator community | Mzansi Collab", description: "A future space for South African creators to connect, share ideas and build collaborations with brands." };

export default function CommunityPage() {
  return <><SiteHeader /><main>
    <section className="community-hero detail-shell"><div><p className="eyebrow eyebrow-dark">Made for connection</p><h1>Create your own path.<br /><em>Find your people.</em></h1><p>There is room for every kind of creative voice in Mzansi. We are building a place to talk about the work, exchange ideas and turn shared ambition into collaboration.</p><span className="community-status">Community features in development</span></div><figure><Image src="/images/collaboration-trio.png" alt="Illustrative scene of three South African creators reviewing their work" width={1672} height={941} priority /><figcaption>Original AI-generated community illustration.</figcaption></figure></section>
    <section className="community-topics detail-shell"><h2>The conversations we want to make possible.</h2><div>{[["Creator circles", "Connect around shared interests: beauty, music, gaming, food, fashion and the work in between."], ["Collaboration calls", "Find a photographer, a storyteller or a fellow creator to bring your next idea to life."], ["Brand know-how", "Exchange experience on briefs, portfolios, deliverables and building professional relationships."]].map(([title, text]) => <article key={title}><span>Planned</span><h3>{title}</h3><p>{text}</p></article>)}</div><p>Discussions, direct messages and member accounts are not open yet. This page introduces the community we are building.</p></section>
    <CreatorCommunity /><section className="community-next detail-shell"><h2>Where will your next idea take you?</h2><Link className="button button-dark" href="/creators">Explore the creator experience →</Link></section>
  </main><SiteFooter /></>;
}
