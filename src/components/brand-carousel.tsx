"use client";

import Image from "next/image";
import { useState } from "react";

const brands = [["Nike", "nike"], ["adidas", "adidas"], ["Samsung", "samsung"], ["Spotify", "spotify"], ["Netflix", "netflix"], ["YouTube", "youtube"], ["PUMA", "puma"], ["Apple", "apple"], ["LG", "lg"], ["Under Armour", "underarmour"]];

export function BrandCarousel() {
  const [paused, setPaused] = useState(false);
  return <section className="brand-carousel" aria-labelledby="brand-carousel-title">
    <div className="brand-carousel-heading"><div><p className="eyebrow eyebrow-dark">The world of brands</p><h2 id="brand-carousel-title">Big ideas. Familiar names. New possibilities.</h2><p>Brands that inspire creative ambition. Shown for inspiration, not as Mzansi Collab partners or available campaigns.</p></div><button onClick={() => setPaused(!paused)} aria-pressed={paused}>{paused ? "Play slideshow" : "Pause slideshow"}</button></div>
    <div className={`brand-viewport ${paused ? "paused" : ""}`}><div className="brand-track">{[0, 1].map((copy) => <div className="brand-set" key={copy} aria-hidden={copy === 1}>{brands.map(([name, slug]) => <div className="brand-tile" key={slug}><Image src={`/brands/${slug}.svg`} alt="" width={78} height={38} loading="eager" /><span>{name}</span></div>)}</div>)}</div></div>
  </section>;
}
