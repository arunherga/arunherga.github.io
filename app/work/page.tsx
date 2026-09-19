import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, FolderCode, Code2 as Github } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { projects } from "@/lib/portfolio";

export const metadata: Metadata = {
  title: "Selected Work — Arun Balakrishna Bhat",
  description: "Open-source Kafka and platform engineering tools by Arun Balakrishna Bhat: kgrep, confluent-terraform-mock, and KafkaEndToEndLatency.",
  alternates: { canonical: "/work/" },
  openGraph: { type: "website", url: "/work/", siteName: "Arun Balakrishna Bhat", title: "Selected Work — Arun Balakrishna Bhat", description: "Kafka tooling, infrastructure sandboxes, and latency profiling. Explore open-source projects by Arun Balakrishna Bhat.", images: [{ url: "/og-work.png", width: 1200, height: 630, alt: "Selected work by Arun Balakrishna Bhat" }] },
  twitter: { card: "summary_large_image", title: "Selected Work — Arun Balakrishna Bhat", description: "Kafka tooling, infrastructure automation, and developer tools by Arun Balakrishna Bhat.", images: ["/og-work.png"] },
};

export default function WorkPage() {
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <SiteHeader work />
    <main id="main">
      <section className="work-intro wrap" id="top" aria-labelledby="work-title">
        <Link className="work-back" href="/"><ArrowLeft size={15} /> Back to home</Link>
        <p className="eyebrow">ARUN@PORTFOLIO:~$ LS ~/WORK</p>
        <h1 id="work-title">Built for the problems<br /><span>behind the platform.</span></h1>
        <p>Selected open-source tools across Kafka, infrastructure, and observability. Each one starts with a practical problem worth making easier.</p>
      </section>
      <section className="work-page-list wrap" aria-label="Selected projects">
        {projects.map((project) => <article className="project-card" key={project.href}>
          <div className="project-visual" aria-hidden="true"><FolderCode size={30} strokeWidth={1.2} /><span className="project-index">{project.number}</span><p>{project.motif}</p></div>
          <div className="project-content"><span className="project-meta">{project.category} / OPEN SOURCE</span><h2>{project.name}</h2><p>{project.description}</p><div className="project-tags" aria-label="Technologies">{project.tags.map((tag) => <span key={tag}>{tag}</span>)}</div><a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`Explore ${project.name} on GitHub`}><Github size={16} /> Explore on GitHub <ArrowUpRight size={15} /></a></div>
        </article>)}
        <p className="work-note">More experiments and tooling on <a href="https://github.com/arunherga" target="_blank" rel="noopener noreferrer">github.com/arunherga ↗</a></p>
      </section>
    </main>
    <SiteFooter />
  </>;
}
