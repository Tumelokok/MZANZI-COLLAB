"use client";

import { BrandLogo } from "@/components/brand-logo";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [["Home", "/"], ["Creators", "/creators"], ["Businesses", "/business"], ["Creator chart", "/chart"], ["Community", "/community"]];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <header className="shared-header">
    <BrandLogo priority />
    <button className="shared-menu-button" aria-expanded={open} aria-controls="site-navigation" onClick={() => setOpen(!open)}>Menu {open ? "−" : "+"}</button>
    <nav id="site-navigation" className={open ? "shared-links open" : "shared-links"} aria-label="Main navigation" onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}>
      {links.map(([label, href]) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
      <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
      <Link className="header-join" href="/signup" onClick={() => setOpen(false)}>Join Mzansi Collab →</Link>
    </nav>
  </header>;
}

export function SiteFooter() {
  return <footer className="shared-footer"><BrandLogo /><p className="footer-location">Made for South Africa’s creative community.</p><nav aria-label="Footer navigation">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}<Link href="/creator-guide">Creator guide</Link><Link href="/dashboard">My dashboard</Link></nav><small>A home for South Africa’s creative community. Direct messaging and campaign applications are still in development.</small></footer>;
}
