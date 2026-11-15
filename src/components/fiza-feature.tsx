import Image from "next/image";
import Link from "next/link";

export function FizaFeature() {
  return (
    <section className="fiza-feature" aria-labelledby="fiza-feature-title" id="fiza">
      <div className="detail-shell fiza-feature-grid">
        <figure className="fiza-portrait">
          <Image src="/images/fiza-founder.jpg" alt="FIZA, South African content creator" fill sizes="(max-width: 800px) 90vw, 35vw" />
          <figcaption><strong>FIZA</strong><span>Creator · Mzansi Collab founder</span></figcaption>
        </figure>
        <div className="fiza-feature-copy">
          <p className="eyebrow">Creator to creator</p>
          <h2 id="fiza-feature-title">My first brand deal.<br /><em>My biggest lesson.</em></h2>
          <p>For FIZA, a first collaboration with Temu meant US$300 and the excitement of working with a major brand. Looking back, the lesson was about being better prepared to negotiate.</p>
          <div className="fiza-topics"><span>Get noticed</span><span>Pitch your idea</span><span>Negotiate your rate</span></div>
          <Link className="button button-gold" href="/creator-guide">Read FIZA’s story & creator guide →</Link>
          <small>A personal experience, shared to help the next creator start with more confidence.</small>
        </div>
      </div>
    </section>
  );
}
