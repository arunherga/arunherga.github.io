"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowUpRight, Monitor, Terminal, X } from "lucide-react";
import { certifications, profile, projects, skillGroups } from "@/lib/portfolio";

type Entry = { command: string; output: string };
const commands = ["help", "whoami", "cat /etc/profile", "skills", "certifications", "projects", "contact", "ls", "pwd", "neofetch", "cd home", "cd about", "cd skills", "cd activity", "cd work", "cd contact", "clear", "exit"];
const helpText = `PROFILE
  whoami              About Arun
  cat /etc/profile    Read the engineer profile
  skills              Languages, platforms, and tools
  certifications      Professional credentials
  projects            Selected open-source work
  contact             Contact details

NAVIGATE
  ls                  List pages and sections
  cd home / work      Open a page
  cd skills           Open the skills section
  cd activity         Open contribution calendars
  cd about / contact  Jump to a section

TERMINAL
  neofetch            Portfolio system info
  pwd                 Current directory
  clear               Clear output (or Ctrl+L)
  exit                Return to visual mode (or Esc)

↑ / ↓ command history · Tab autocomplete`;

function outputFor(command: string): string {
  switch (command) {
    case "help": return helpText;
    case "whoami": case "about": case "cat /etc/profile": return `${profile.name}\n${profile.role} · ${profile.location}\n\n${profile.summary}\n\nAsk me about CDC performance, Kafka Connect, GitOps,\nor keeping a streaming platform reliable in production.`;
    case "skills": case "cat skills.md": return skillGroups.map((group) => `${group.title.toUpperCase()}\n  ${group.skills.map((skill) => skill.name).join(" · ")}\n  ${group.description}`).join("\n\n");
    case "certifications": return certifications.map((certificate) => `${certificate.short} — ${certificate.name}\n  ${certificate.issuer}\n  ${certificate.href}`).join("\n\n");
    case "projects": case "work": return projects.map((project) => `${project.number}  ${project.name}\n    ${project.tags.join(" · ")}\n    ${project.href}`).join("\n\n") + "\n\nType 'cd work' to explore the project page.";
    case "contact": return `EMAIL     ${profile.email}\nGITHUB    github.com/arunherga\nLINKEDIN  linkedin.com/in/arunbbhat\nLEETCODE  leetcode.com/u/arunHerga\nLOCATION  ${profile.location}`;
    case "ls": return "drwxr-xr-x  home/\ndrwxr-xr-x  about/\ndrwxr-xr-x  skills/\ndrwxr-xr-x  activity/\ndrwxr-xr-x  work/\ndrwxr-xr-x  contact/";
    case "pwd": return "/home/arun/portfolio";
    case "neofetch": return `       /\\        arun@portfolio\n      /  \\       ─────────────────────────\n     / ab \\      Name: ${profile.name}\n    /______\\     Role: ${profile.role}\n                  Location: ${profile.location}\n                  Host: arunbhat.com\n                  Platform: GitHub Pages\n                  Stack: Kafka · Kubernetes · Terraform\n                  Languages: Go · Python · Bash`;
    default: return `Command not found: ${command}\nType 'help' to see the available portfolio commands.`;
  }
}

export function PortfolioTerminal() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    function onKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.ctrlKey && event.key.toLowerCase() === "l") { event.preventDefault(); setEntries([]); }
      if (event.key === "Tab") {
        if (event.defaultPrevented) return;
        const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('a[href], button, input') ?? []).filter((element) => element.getClientRects().length > 0);
        if (!focusable?.length) return;
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); trigger?.focus(); };
  }, [open]);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ block: "nearest" }); }, [entries, open]);

  function execute(raw: string) {
    const command = raw.trim().toLowerCase().replace(/\s+/g, " ");
    setInput(""); setHistoryIndex(-1);
    if (!command) return;
    if (command === "clear") { setEntries([]); return; }
    if (command === "exit") { setOpen(false); return; }
    const routes: Record<string, string> = { home: "/", work: "/work/", projects: "/work/", about: "/#about", skills: "/#skills", activity: "/#activity", contact: "/#contact" };
    if (command.startsWith("cd ") && routes[command.slice(3)]) { setOpen(false); window.location.assign(routes[command.slice(3)]); return; }
    setEntries((previous) => [...previous, { command, output: outputFor(command) }]);
    inputRef.current?.focus();
  }

  function submit(event: FormEvent) { event.preventDefault(); execute(input); }
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Tab" && input.trim() && !event.shiftKey) {
      const matches = commands.filter((command) => command.startsWith(input.toLowerCase()));
      if (matches.length) {
        event.preventDefault();
        if (matches.length === 1) setInput(matches[0]);
        else setEntries((previous) => [...previous, { command: input, output: matches.join("   ") }]);
      }
    }
    if ((event.key === "ArrowUp" || event.key === "ArrowDown") && entries.length) {
      event.preventDefault();
      const next = event.key === "ArrowUp" ? Math.min(historyIndex + 1, entries.length - 1) : Math.max(historyIndex - 1, -1);
      setHistoryIndex(next); setInput(next === -1 ? "" : entries[entries.length - 1 - next].command);
    }
  }

  return <>
    <button ref={triggerRef} className="terminal-toggle" type="button" onClick={() => setOpen(true)} aria-label="Open portfolio terminal"><Terminal size={16} /><span>Terminal</span></button>
    {open && createPortal(
      <div ref={dialogRef} className="terminal-overlay" role="dialog" aria-modal="true" aria-labelledby="terminal-title">
        <div className="terminal-shell">
          <section className="terminal-pane terminal-profile">
            <div className="terminal-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span id="terminal-title">portfolio.sh — bash</span><button className="terminal-close" type="button" onClick={() => setOpen(false)}><Monitor size={15} /> UI Mode <X size={15} /></button></div>
            <div className="terminal-pane-body">
              <section><p className="terminal-command">arun@portfolio:~$ cat /etc/profile</p><h2># ENGINEER PROFILE</h2><dl className="terminal-details"><div><dt>NAME</dt><dd>{profile.name}</dd></div><div><dt>ROLE</dt><dd>{profile.role}</dd></div><div><dt>LOCATION</dt><dd>{profile.location}</dd></div><div><dt>EMAIL</dt><dd><a href={`mailto:${profile.email}`}>{profile.email}</a></dd></div></dl><p>{profile.summary}</p></section>
              <section><p className="terminal-command">arun@portfolio:~$ cat skills.md</p><h2># TOOLKIT</h2><div className="terminal-skill-list">{skillGroups.map((group) => <p key={group.id}><strong>{group.title}</strong><span>{group.skills.map((skill) => skill.name).join(" · ")}</span></p>)}</div></section>
              <section><p className="terminal-command">arun@portfolio:~$ ls -la</p><h2># NAVIGATE</h2><div className="terminal-directory">{[{ name: "home", href: "/" }, { name: "skills", href: "/#skills" }, { name: "work", href: "/work/" }, { name: "activity", href: "/#activity" }, { name: "contact", href: "/#contact" }].map((item) => <a key={item.name} href={item.href} onClick={() => setOpen(false)}><span>drwxr-xr-x</span> {item.name}/ <ArrowUpRight size={12} /></a>)}</div></section>
              <div className="terminal-socials"><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href={`mailto:${profile.email}`}>Email ↗</a></div>
            </div><div className="terminal-status"><span>● PROFILE LOADED</span><span>UDUPI / INDIA</span></div>
          </section>
          <section className="terminal-pane terminal-console" aria-label="Interactive portfolio terminal">
            <div className="terminal-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>terminal — interactive</span><button className="terminal-close terminal-mobile-close" type="button" onClick={() => setOpen(false)}><Monitor size={14} /> UI Mode</button></div>
            <div className="terminal-console-body"><div className="terminal-wordmark" aria-hidden="true">BUILD<span>_</span></div><p className="terminal-welcome">Welcome to Arun&apos;s portfolio.<br />Type <b>help</b> to explore. Press <b>Tab</b> to complete a command.</p><div className="terminal-shortcuts">{["whoami", "skills", "projects", "help"].map((command) => <button key={command} type="button" onClick={() => execute(command)}>{command}</button>)}</div><div className="terminal-history" role="log" aria-live="polite" aria-relevant="additions">{entries.map((entry, index) => <div className="terminal-entry" key={index}><p><span>arun@portfolio:~$</span> {entry.command}</p><pre>{entry.output}</pre></div>)}<div ref={endRef} /></div></div>
            <form className="terminal-prompt" onSubmit={submit}><label htmlFor="portfolio-command">arun@portfolio:~$</label><input id="portfolio-command" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={keyDown} autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Terminal command" placeholder="Type a command…" /><span aria-hidden="true" className="terminal-input-cursor">▊</span></form>
            <div className="terminal-status"><span>● SYSTEM ONLINE</span><span>ESC → UI MODE</span></div>
          </section>
        </div>
      </div>, document.body)}
  </>;
}
