import Image from "next/image";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { FizaFeature } from "@/components/fiza-feature";
import { CreatorCommunity } from "@/components/creator-community";
import { BrandCarousel } from "@/components/brand-carousel";

export default function Home() {
  return <><SiteHeader /><main>
    <section className="collab-hero"><div className="detail-shell collab-hero-grid"><div className="collab-hero-copy"><p className="eyebrow">Your talent. Their next big idea.</p><h1>That next<br />“let’s collab”<br /><em>starts here.</em></h1><p>Meet brands that see your potential. Build your creator profile, share what makes you different and find your people.</p><div className="detail-actions"><Link className="button button-gold" href="/signup">Join as a creator →</Link><Link className="button button-ghost" href="/business">I’m building a brand →</Link></div><small>Original AI illustration · example invitations</small></div><div className="collab-hero-art"><Image src="/images/creator-collab-notifications.png" alt="Illustration of an excited creator reading a collaboration email, with example messages: We love your content, Let’s collaborate, New brand opportunity" width={1122} height={1402} priority sizes="(max-width: 800px) 94vw, 52vw" /></div></div></section>
    <BrandCarousel />
    <CreatorCommunity />
    <FizaFeature />
    <section id="opportunities" className="community-next detail-shell"><p className="eyebrow eyebrow-dark">The next chapter</p><h2>Profiles. Portfolios. Opportunities.</h2><p>Create your profile, explore the creator chart and build towards your next brand conversation.</p><div className="detail-actions" id="get-started"><Link href="/signup" className="button button-dark">Create your account →</Link><Link href="/chart" className="button button-dark">Explore the creator chart →</Link></div></section>
  </main><SiteFooter /></>;
}
