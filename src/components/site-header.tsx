"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [["Home", "/"], ["Creators & influencers", "/creators"], ["Brands & businesses", "/business"], ["Community", "/community"], ["Creator guide", "/creator-guide"]];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="shared-header">
    <Link className="detail-brand" href="/" aria-label="Mzansi Collab home"><Image src="/branding/logo-dark-header.png" alt="Mzansi Collab" width={1719} height={405} priority /></Link>
    <button className="shared-menu-button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>Menu {open ? "−" : "+"}</button>
    <nav id="site-navigation" className={open ? "shared-links open" : "shared-links"} aria-label="Main navigation" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="shared-footer"><p>Mzansi Collab · South Africa</p><nav aria-label="Footer navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav><small>Building a home for creative collaboration. Community messaging and account registration are coming later.</small></footer>;
}
