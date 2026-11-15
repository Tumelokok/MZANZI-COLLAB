import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { FizaFeature } from "@/components/fiza-feature";
import { CreatorCommunity } from "@/components/creator-community";
import { BrandCarousel } from "@/components/brand-carousel";

export default function Home() {
  return <><SiteHeader /><main>
    <section className="gateway-hero"><Image src="/images/solo-fashion.png" alt="Illustrative solo fashion creator recording content in a Johannesburg studio" fill priority sizes="100vw" /><div className="gateway-shade" /><div className="detail-shell gateway-copy"><p className="eyebrow">Mzansi’s creative economy, connected.</p><h1>Your people.<br />Your possibilities.<br /><em>Your next collab.</em></h1><p>A home for South African creators, influencers, brands and agencies to find each other and make meaningful work happen.</p><div className="detail-actions"><Link className="button button-gold" href="/creators">For creators & influencers →</Link><Link className="button button-ghost" href="/business">For brands & businesses →</Link></div><small>Platform in development · Original AI-generated scene</small></div></section>
    <BrandCarousel />
    <CreatorCommunity />
    <FizaFeature />
    <section id="opportunities" className="community-next detail-shell"><p className="eyebrow eyebrow-dark">The next chapter</p><h2>Profiles. Portfolios. Opportunities.</h2><p>We are building the foundations for professional collaborations. Explore the experience for your side of the creative economy.</p><div className="detail-actions" id="get-started"><Link href="/creators" className="button button-dark">Explore creator tools →</Link><Link href="/business" className="button button-dark">Explore brand tools →</Link></div></section>
  </main><SiteFooter /></>;
}
