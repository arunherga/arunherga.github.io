import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  BriefcaseBusiness,
  Layers3,
  Mail,
  Terminal,
  Trophy,
  Workflow,
} from "lucide-react";
import { GitHubActivity } from "@/components/github-activity";
import { LeetCodeActivity } from "@/components/leetcode-activity";

const focus = [
  { number: "01", icon: Layers3, title: "Reliable foundations", text: "Infrastructure that gives teams a dependable place to build, run, and grow." },
  { number: "02", icon: Workflow, title: "Less friction. More flow.", text: "Automation that connects the steps between an idea and running software." },
  { number: "03", icon: Terminal, title: "Developers first", text: "Clear interfaces, useful tooling, and a simpler path through everyday complexity." },
];

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

const contacts = [
  { label: "LinkedIn", detail: "Connect professionally", href: "https://www.linkedin.com/in/arunbbhat/", icon: BriefcaseBusiness, external: true },
  { label: "GitHub", detail: "Explore public work", href: "https://github.com/arunherga", icon: Code2, external: true },
  { label: "LeetCode", detail: "See problem solving", href: "https://leetcode.com/u/arunHerga/", icon: Trophy, external: true },
  { label: "arun.b.bhat@gmail.com", detail: "Send an email", href: "mailto:arun.b.bhat@gmail.com", icon: Mail, external: false },
];

export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="site-header wrap">
        <a className="brand" href="#top" aria-label="Arun Balakrishna Bhat home">
          <span className="brand-mark">ab<span>.</span></span>
          <span className="brand-name">Arun Balakrishna Bhat</span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#about">About</a>
          <a href="#focus">Focus</a>
          <a href="#activity">Activity</a>
          <a href="#work">Work</a>
          <a href="#contact">Contact <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <main id="main">
        <section className="hero wrap" id="top" aria-labelledby="hero-title">
          <div className="eyebrow">
            <span className="tiny-cross" aria-hidden="true">+</span> ARUN BALAKRISHNA BHAT
            <span className="eyebrow-tail">/ PERSONAL PORTFOLIO</span>
          </div>
          <h1 id="hero-title">Platform<br/><span className="engineer">engineer<span className="period">.</span></span></h1>
          <div className="hero-bottom">
            <p>The foundation behind<br/>what comes next.</p>
            <a className="round-link" href="#about" aria-label="Explore about Arun"><ArrowDown size={24} /></a>
            <span className="hero-note">INFRASTRUCTURE<br/>AUTOMATION<br/>DEVELOPER EXPERIENCE</span>
          </div>
        </section>

        <div className="system-strip">
          <div className="wrap system-inner">
            <span className="system-label">FROM IDEA TO IMPACT</span>
            <div className="pipeline" aria-label="Code moves through the platform into production">
              <span><Terminal size={18} /> Code</span>
              <span className="connector" aria-hidden="true" />
              <span className="platform-step"><Layers3 size={18} /> Platform</span>
              <span className="connector" aria-hidden="true" />
              <span>Production <ArrowUpRight size={18} /></span>
            </div>
          </div>
        </div>

        <section id="activity" className="activity wrap section-grid" aria-labelledby="activity-title">
          <div className="section-label"><span>01 / ACTIVITY</span><span className="label-line" /></div>
          <div>
            <h2 id="activity-title">The work in <span>motion.</span></h2>
            <p className="activity-intro">GitHub contributions and LeetCode practice, shown here from my public profiles.</p>
            <div className="activity-panels">
              <GitHubActivity username="arunherga" />
              <LeetCodeActivity />
            </div>
          </div>
        </section>

        <section id="about" className="about wrap section-grid" aria-labelledby="about-title">
          <div className="section-label"><span>02 / ABOUT</span><span className="label-line" /></div>
          <div>
            <h2 id="about-title">Behind every great product,<br/>a strong <span>foundation.</span></h2>
            <div className="about-copy">
              <p>I’m Arun Balakrishna Bhat,<br/>a platform engineer.</p>
              <p>Platform engineering brings infrastructure, automation, and developer experience together—making the path from writing code to running software more dependable.</p>
            </div>
          </div>
        </section>

        <section id="focus" className="focus wrap section-grid" aria-labelledby="focus-title">
          <div className="section-label"><span>03 / THE FOCUS</span><span className="label-line" /></div>
          <div>
            <h2 id="focus-title" className="focus-heading">Make the complex<br/>feel straightforward.</h2>
            <div className="focus-list">
              {focus.map(({ number, icon: Icon, title, text }) => (
                <article className="focus-row" key={number}>
                  <span className="focus-number">{number}</span>
                  <div className="focus-content"><h3>{title}</h3><p>{text}</p></div>
                  <Icon className="focus-icon" size={27} strokeWidth={1.4} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="work wrap section-grid" aria-labelledby="work-title">
          <div className="section-label"><span>04 / SELECTED WORK</span><span className="label-line" /></div>
          <div>
            <h2 id="work-title">Tools built for <span>real problems.</span></h2>
            <p className="work-intro">A few projects across Kafka, infrastructure, and developer tooling.</p>
            <div className="work-list">
              {projects.map((project, index) => (
                <article className={`work-card${index === 0 ? " work-card-featured" : ""}`} key={project.href}>
                  <div className="work-card-top"><span>{project.number} / {project.category}</span><ArrowUpRight size={22} strokeWidth={1.5} /></div>
                  <h3>{project.name}</h3>
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
          </div>
        </section>

        <section id="contact" className="contact wrap section-grid" aria-labelledby="contact-title">
          <div className="section-label"><span>05 / CONTACT</span><span className="label-line" /></div>
          <div>
            <h2 id="contact-title">Let’s <span>connect.</span></h2>
            <p className="contact-copy">Find me on LinkedIn, GitHub, or LeetCode, or get in touch by email.</p>
            <div className="contact-links">
              {contacts.map(({ label, detail, href, icon: Icon, external }) => (
                <a
                  className="contact-link"
                  href={href}
                  key={href}
                  {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                >
                  <Icon size={22} strokeWidth={1.6} />
                  <span>{label}</span>
                  <small>{detail}</small>
                  <ArrowUpRight size={19} strokeWidth={1.6} />
                </a>
              ))}
            </div>
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
    </>
  );
}
