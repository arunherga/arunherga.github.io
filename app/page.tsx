import {
  ArrowDown,
  ArrowUpRight,
  Code2,
  BriefcaseBusiness,
  Layers3,
  Mail,
  Terminal,
  Workflow,
} from "lucide-react";
import { GitHubActivity } from "@/components/github-activity";

const focus = [
  { number: "01", icon: Layers3, title: "Reliable foundations", text: "Infrastructure that gives teams a dependable place to build, run, and grow." },
  { number: "02", icon: Workflow, title: "Less friction. More flow.", text: "Automation that connects the steps between an idea and running software." },
  { number: "03", icon: Terminal, title: "Developers first", text: "Clear interfaces, useful tooling, and a simpler path through everyday complexity." },
];

const contacts = [
  { label: "LinkedIn", detail: "Connect professionally", href: "https://www.linkedin.com/in/arunbbhat/", icon: BriefcaseBusiness, external: true },
  { label: "GitHub", detail: "Explore public work", href: "https://github.com/arunherga", icon: Code2, external: true },
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

        <section id="about" className="about wrap section-grid" aria-labelledby="about-title">
          <div className="section-label"><span>01 / ABOUT</span><span className="label-line" /></div>
          <div>
            <h2 id="about-title">Behind every great product,<br/>a strong <span>foundation.</span></h2>
            <div className="about-copy">
              <p>I’m Arun Balakrishna Bhat,<br/>a platform engineer.</p>
              <p>Platform engineering brings infrastructure, automation, and developer experience together—making the path from writing code to running software more dependable.</p>
            </div>
          </div>
        </section>

        <section id="focus" className="focus wrap section-grid" aria-labelledby="focus-title">
          <div className="section-label"><span>02 / THE FOCUS</span><span className="label-line" /></div>
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

        <section id="activity" className="activity wrap section-grid" aria-labelledby="activity-title">
          <div className="section-label"><span>03 / ACTIVITY</span><span className="label-line" /></div>
          <div>
            <h2 id="activity-title">The work in <span>motion.</span></h2>
            <p className="activity-intro">A look at recent public work and contributions on GitHub.</p>
            <GitHubActivity username="arunherga" />
          </div>
        </section>

        <section id="contact" className="contact wrap section-grid" aria-labelledby="contact-title">
          <div className="section-label"><span>04 / CONTACT</span><span className="label-line" /></div>
          <div>
            <h2 id="contact-title">Let’s <span>connect.</span></h2>
            <p className="contact-copy">Find me on LinkedIn or GitHub, or get in touch by email.</p>
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
