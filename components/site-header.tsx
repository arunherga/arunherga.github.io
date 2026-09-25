"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { PortfolioTerminal } from "./portfolio-terminal";
import { profile } from "@/lib/portfolio";

export function SiteHeader({ work = false }: { work?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const home = work ? "/" : "";
  return (
    <header className="site-header">
      <div className="header-inner wrap">
        <Link className="brand" href="/" aria-label={`${profile.name} home`}>
          <span className="brand-mark" aria-hidden="true">ab<span>_</span></span>
          <span className="brand-name">{profile.name}<span>PLATFORM ENGINEER</span></span>
        </Link>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"} aria-label="Main navigation">
          {[{ label: "Home", href: `${home}#top` }, { label: "About", href: `${home}#about` }, { label: "Skills", href: `${home}#skills` }, { label: "Activity", href: `${home}#activity` }].map((item) => (
            <a key={item.label} href={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>
          ))}
          <Link href="/work/" aria-current={work ? "page" : undefined} onClick={() => setMenuOpen(false)}>Work</Link>
          <a href="https://arun-private-intelligence.arun-private-intelligence.workers.dev/" title="Private reports — sign-in required" onClick={() => setMenuOpen(false)}>Reports</a>
          <a href={`${home}#contact`} onClick={() => setMenuOpen(false)}>Contact</a>
        </nav>
        <div className="header-actions">
          <PortfolioTerminal />
          <button className="mobile-menu-button" type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>
  );
}
