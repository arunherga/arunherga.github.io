/* eslint-disable @next/next/no-html-link-for-pages -- Full-page links avoid a vinext client-navigation error. */
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PortfolioTerminal } from "@/components/portfolio-terminal";

export const metadata: Metadata = {
  title: "Selected Work — Arun Balakrishna Bhat",
  description: "Selected platform engineering projects by Arun Balakrishna Bhat, including kgrep, confluent-terraform-mock, and KafkaEndToEndLatency.",
  alternates: { canonical: "/work" },
  openGraph: {
    type: "website",
    url: "/work",
    siteName: "Arun Balakrishna Bhat",
    title: "Selected Work — Arun Balakrishna Bhat",
    description: "Explore kgrep, confluent-terraform-mock, and KafkaEndToEndLatency: platform engineering projects by Arun Balakrishna Bhat.",
    images: [{ url: "/og-work.png", width: 1200, height: 630, alt: "Selected work by Arun Balakrishna Bhat" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Selected Work — Arun Balakrishna Bhat",
    description: "Kafka tooling, infrastructure automation, and developer tools by Arun Balakrishna Bhat.",
    images: ["/og-work.png"],
  },
};

const projects = [
  {
    number: "01",
    name: "kgrep",
    category: "KAFKA TOOLING",
    description: "A command-line tool for searching, watching, and exporting Kafka topic records without writing a one-off consumer. It also helps inspect topics and consumer-group lag.",
    tags: ["Go", "Apache Kafka", "CLI", "Schema Registry"],
    href: "https://github.com/arunherga/kgrep",
  },
  {
    number: "02",
    name: "confluent-terraform-mock",
    category: "INFRASTRUCTURE SANDBOX",
    description: "A local Confluent Cloud stand-in that lets you run real Terraform plan, apply, and destroy workflows without touching a live cloud account.",
    tags: ["Go", "Terraform", "Confluent Cloud"],
    href: "https://github.com/arunherga/confluent-terraform-mock",
  },
  {
    number: "03",
    name: "KafkaEndToEndLatency",
    category: "OBSERVABILITY",
    description: "A Kafka latency profiler that measures time between message timestamps and reports topic-wide and per-partition results to Kafka or CSV.",
    tags: ["Python", "Apache Kafka", "Latency"],
    href: "https://github.com/arunherga/KafkaEndToEndLatency",
  },
];

export default function WorkPage() {
  return (
    <div className="work-page" id="top">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header wrap">
        <a className="brand" href="/" aria-label="Arun Balakrishna Bhat home">
          <span className="brand-mark">ab<span>.</span></span>
          <span className="brand-name">Arun Balakrishna Bhat</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="/#about">About</a>
          <a href="/#focus">Focus</a>
          <a href="/#activity">Activity</a>
          <a href="/work" aria-current="page">Work</a>
          <a href="/#contact">Contact <ArrowUpRight size={15} /></a>
          <PortfolioTerminal />
        </nav>
      </header>

      <main id="main">
        <div className="work-page-intro wrap">
          <a className="work-back" href="/"><ArrowLeft size={17} /> Back to home</a>
          <p className="eyebrow">ARUN BALAKRISHNA BHAT / SELECTED WORK</p>
          <h1>Tools built for <span>real problems.</span></h1>
          <p>A few projects across Kafka, infrastructure, and developer tooling.</p>
        </div>

        <section className="work wrap section-grid" aria-label="Selected work">
          <div className="section-label"><span>01 / PROJECTS</span><span className="label-line" /></div>
          <div className="work-list">
            {projects.map((project, index) => (
              <article className={`work-card${index === 0 ? " work-card-featured" : ""}`} key={project.href}>
                <div className="work-card-top"><span>{project.number} / {project.category}</span><ArrowUpRight size={22} strokeWidth={1.5} /></div>
                <h2>{project.name}</h2>
                <p>{project.description}</p>
                <div className="work-tags" aria-label="Technologies">
                  {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <a href={project.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${project.name} on GitHub`}>
                  Explore project <ArrowUpRight size={17} />
                </a>
              </article>
            ))}
          </div>
        </section>
      </main>

      <footer className="wrap">
        <div className="footer-top">
          <span className="brand-mark">ab<span>.</span></span>
          <p>Arun Balakrishna Bhat<span>Platform engineer</span></p>
          <a href="#top">Back to top <ArrowUpRight size={18} /></a>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Arun Balakrishna Bhat</span>
          <span>Built on strong foundations.</span>
        </div>
      </footer>
    </div>
  );
}
