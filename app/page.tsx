import Link from "next/link";
import { ArrowDown, ArrowUpRight, Award, Boxes, Code2, Database, GitBranch, Code2 as Github, BriefcaseBusiness as Linkedin, Mail, MapPin, Network, Terminal, Trophy } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { GitHubActivity } from "@/components/github-activity";
import { LeetCodeActivity } from "@/components/leetcode-activity";
import { certifications, profile, skillGroups } from "@/lib/portfolio";

const areas = [
  { icon: Network, title: "Streaming infrastructure", text: "Kafka internals, consumer lag, and Schema Registry—the systems and signals behind dependable data streams." },
  { icon: Boxes, title: "Platforms that run", text: "Kubernetes, containers, and cloud infrastructure that give data products a place to operate." },
  { icon: GitBranch, title: "Infrastructure as code", text: "Terraform workflows and provider tooling that make infrastructure easier to test and manage." },
  { icon: Code2, title: "Tools for the operator", text: "Go, Python, and shell tools that turn everyday platform tasks into clear, repeatable workflows." },
];

const personJsonLd = {
  "@context": "https://schema.org", "@type": "Person", name: profile.name,
  jobTitle: profile.role, url: "https://arunbhat.com", sameAs: [profile.github, profile.linkedin, profile.leetcode],
  knowsAbout: skillGroups.flatMap((group) => group.skills.map((skill) => skill.name)),
  address: { "@type": "PostalAddress", addressLocality: "Udupi", addressCountry: "IN" },
};

export default function Home() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main">
        <section className="hero wrap" id="top" aria-labelledby="hero-title">
          <div className="hero-canvas">
            <div className="hero-grid" aria-hidden="true" />
            <span className="frame-corner top-left" aria-hidden="true" /><span className="frame-corner top-right" aria-hidden="true" />
            <span className="frame-corner bottom-left" aria-hidden="true" /><span className="frame-corner bottom-right" aria-hidden="true" />
            <div className="ambient-code" aria-hidden="true"><span>01</span><span>{"{ }"}</span><span>λ</span><span>0x</span><span>://</span><span>01</span><span>+</span><span>$_</span></div>
            <div className="identity-panel">
              <p className="identity-title"><span className="status-dot" /> IDENTITY.SYS <span>{"// LOADED"}</span></p>
              <dl>
                <div><dt>ROLE</dt><dd>Platform Engineer</dd></div>
                <div><dt>BASE</dt><dd>Udupi, India</dd></div>
                <div><dt>STACK</dt><dd>Kafka · Kubernetes<br />Terraform · Go · Python</dd></div>
                <div><dt>FOCUS</dt><dd>Streaming infrastructure<br />&amp; developer tooling</dd></div>
              </dl>
              <span className="identity-cursor" aria-hidden="true">▊ _</span>
            </div>
            <div className="hero-heading">
              <p className="eyebrow"><span className="small-hex" aria-hidden="true">⬡</span> PLATFORM ENGINEER</p>
              <h1 id="hero-title" aria-label={profile.name}>ARUN<br />BALAKRISHNA<br /><span>BHAT<span className="name-cursor" aria-hidden="true">_</span></span></h1>
              <p className="hero-tagline">Building the platforms <br />behind the data.</p>
            </div>
            <div className="hero-orbit" aria-hidden="true"><div className="orbit-ring" /><div className="orbit-ring inner" /><div className="orbit-logo">ab<span>.</span></div><span className="orbit-coordinate">AB / SYS</span></div>
            <div className="hero-system-line"><span><i /> SYSTEM ONLINE</span><span>MODE <b>BUILD &amp; OPERATE</b></span><span>LOCATION <b>IN / UDUPI</b></span></div>
          </div>
          <div className="hero-bottom">
            <div className="hero-actions"><Link className="button-primary" href="/work/">Explore my work <ArrowUpRight size={17} /></Link><a className="button-text" href="#contact">Get in touch <ArrowUpRight size={16} /></a></div>
            <span className="hero-prompt">arun@portfolio:~$ ./build-the-platform</span>
            <div className="social-icons"><a href={profile.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><Github size={19} /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin size={19} /></a><a href={`mailto:${profile.email}`} aria-label="Email Arun"><Mail size={19} /></a></div>
          </div>
          <a className="scroll-cue" href="#about" aria-label="Scroll to about"><ArrowDown size={18} /></a>
        </section>

        <section id="about" className="section wrap about-section" aria-labelledby="about-title">
          <div className="section-heading centered"><span className="eyebrow">01 / ABOUT</span><h2 id="about-title">The engineer behind the platform.</h2><p>I’m {profile.name}, a platform engineer in Udupi, India. I build and run the streaming infrastructure that data products sit on—and write the tools that make those platforms easier to operate.</p></div>
          <div className="focus-grid">{areas.map(({ icon: Icon, title, text }) => <article className="focus-card" key={title}><span className="square-icon"><Icon size={23} strokeWidth={1.6} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
          <div className="about-note"><Terminal size={17} /><p>Ask me about Kafka internals, consumer lag, Schema Registry, or writing your own Terraform provider.</p></div>
        </section>

        <section id="skills" className="section section-tint" aria-labelledby="skills-title"><div className="wrap">
          <div className="section-heading"><span className="eyebrow">02 / SKILLS &amp; TOOLKIT</span><h2 id="skills-title">The tools I work with.</h2><p>From a shell script to a streaming platform. These are the languages, systems, and services in my toolkit.</p></div>
          <div className="skill-groups">{skillGroups.map((group) => <article className="skill-group" key={group.id}><div className="skill-group-label"><span>{group.id}</span><h3>{group.title}</h3></div><div className="skill-tiles">{group.skills.map((skill) => <div className="skill-tile" key={skill.name}><span className="skill-mark" aria-hidden="true">{skill.mark}</span><span>{skill.name}</span></div>)}</div></article>)}</div>
          <div className="skills-source"><GitBranch size={15} /><span>Also on my <a href="https://github.com/arunherga/arunherga" target="_blank" rel="noopener noreferrer">GitHub profile <ArrowUpRight size={13} /></a></span></div>
        </div></section>

        <section id="certifications" className="section wrap certifications" aria-labelledby="certifications-title">
          <div className="section-heading"><span className="eyebrow">03 / CERTIFICATIONS</span><h2 id="certifications-title">Learning, put into practice.</h2></div>
          <div className="certification-grid">{certifications.map((certificate) => <a className="certification-card" href={certificate.href} target="_blank" rel="noopener noreferrer" key={certificate.short}><div className="certificate-top"><Award size={24} /><span>{certificate.short}</span><ArrowUpRight size={17} /></div><h3>{certificate.name}</h3><p>{certificate.issuer}</p><span className="certificate-action">View credential <ArrowUpRight size={14} /></span></a>)}</div>
        </section>

        <section id="activity" className="section section-tint" aria-labelledby="activity-title"><div className="wrap activity-wrap">
          <div className="section-heading"><span className="eyebrow">04 / ACTIVITY</span><h2 id="activity-title">Small commits. Steady progress.</h2><p>My public GitHub contributions and LeetCode practice, right here. The contribution calendars refresh every six hours when the scheduled build runs.</p></div>
          <div className="activity-panels"><GitHubActivity username="arunherga" /><LeetCodeActivity /></div>
        </div></section>

        <section className="work-callout wrap"><div><span className="eyebrow">BUILT IN THE OPEN</span><h2>Tools for real platform problems.</h2><p>Kafka search, infrastructure sandboxes, and latency profiling.</p></div><Link className="button-primary" href="/work/">View selected work <ArrowUpRight size={18} /></Link></section>

        <section id="contact" className="section wrap contact-section" aria-labelledby="contact-title">
          <div className="section-heading centered"><span className="eyebrow">05 / CONTACT</span><h2 id="contact-title">Let’s connect.</h2><p>Have a platform problem to talk through, a tool to build, or an idea to share? My inbox is open.</p></div>
          <div className="contact-grid"><a href={profile.github} target="_blank" rel="noopener noreferrer"><Github size={20} /> GitHub <ArrowUpRight size={16} /></a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer"><Linkedin size={20} /> LinkedIn <ArrowUpRight size={16} /></a><a href={profile.leetcode} target="_blank" rel="noopener noreferrer"><Trophy size={20} /> LeetCode <ArrowUpRight size={16} /></a><a href={`mailto:${profile.email}`}><Mail size={20} /> Email <ArrowUpRight size={16} /></a></div>
          <a className="contact-email" href={`mailto:${profile.email}`}>{profile.email}<ArrowUpRight size={21} /></a><p className="location-line"><MapPin size={14} /> Udupi, India <span aria-hidden="true">/</span><Database size={14} /> Platforms · Data · Tools</p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
