/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-location-assign-relative-destination -- Full-page navigation avoids a vinext client-navigation error. */
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Monitor, Terminal, X } from "lucide-react";

type Entry = { command: string; output: string };

const helpText = `Available commands
  help       Show commands
  whoami     About Arun
  skills     Areas of focus
  projects   Selected projects
  contact    Contact details
  ls         Navigation
  cd work    Open the work page
  cd home    Open the home page
  clear      Clear this window
  exit       Return to the website`;

function getOutput(command: string): string {
  switch (command) {
    case "help": return helpText;
    case "whoami":
    case "about": return "Arun Balakrishna Bhat\nPlatform engineer building reliable infrastructure, automation, and developer tools.";
    case "skills": return "FOCUS\n  Platform engineering\n  Apache Kafka tooling\n  Infrastructure automation\n  Developer experience";
    case "projects":
    case "work": return "SELECTED WORK\n  01  kgrep\n  02  confluent-terraform-mock\n  03  KafkaEndToEndLatency\n\nOpen /work to explore the projects.";
    case "contact": return "EMAIL     arun.b.bhat@gmail.com\nLINKEDIN  linkedin.com/in/arunbbhat\nGITHUB    github.com/arunherga\nLEETCODE  leetcode.com/u/arunHerga";
    case "ls": return "home/   work/   about/   activity/   contact/";
    default: return `Command not found: ${command}\nType "help" for available commands.`;
  }
}

export function PortfolioTerminal() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ block: "end" });
  }, [entries, open]);

  function runCommand(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const command = input.trim().toLowerCase().replace(/\s+/g, " ");
    setInput("");
    if (!command) return;
    if (command === "clear") {
      setEntries([]);
      return;
    }
    if (command === "exit") {
      setOpen(false);
      return;
    }
    if (command === "cd work" || command === "cd projects") {
      window.location.assign("/work");
      return;
    }
    if (command === "cd home") {
      window.location.assign("/");
      return;
    }
    setEntries((previous) => [...previous, { command, output: getOutput(command) }]);
  }

  return (
    <>
      <button className="terminal-toggle" type="button" onClick={() => setOpen(true)} aria-label="Open portfolio terminal">
        <Terminal size={17} strokeWidth={1.8} /> Terminal
      </button>
      {open && (
        <div className="terminal-overlay" role="dialog" aria-modal="true" aria-labelledby="terminal-title">
          <div className="terminal-shell">
            <div className="terminal-pane terminal-profile">
              <div className="terminal-bar">
                <span className="window-dots" aria-hidden="true"><i /><i /><i /></span>
                <span id="terminal-title">arun@portfolio — profile</span>
                <button type="button" className="terminal-close" onClick={() => setOpen(false)}><Monitor size={16} /> UI Mode <X size={15} /></button>
              </div>
              <div className="terminal-pane-body">
                <p className="terminal-command">arun@portfolio:~$ cat /etc/profile</p>
                <h2># ENGINEER PROFILE</h2>
                <div className="terminal-details">
                  <span>NAME</span><strong>Arun Balakrishna Bhat</strong>
                  <span>ROLE</span><strong>Platform Engineer</strong>
                  <span>FOCUS</span><strong>Infrastructure · Kafka · Automation</strong>
                  <span>EMAIL</span><strong>arun.b.bhat@gmail.com</strong>
                </div>
                <p>I build the platforms and tools that help software teams move with confidence.</p>
                <div className="terminal-divider" />
                <p className="terminal-command">arun@portfolio:~$ ls -la</p>
                <h2># EXPLORE</h2>
                <div className="terminal-directory">
                  <a href="/">drwxr-xr-x home/</a>
                  <a href="/work">drwxr-xr-x work/</a>
                  <a href="/#activity">drwxr-xr-x activity/</a>
                  <a href="/#contact">drwxr-xr-x contact/</a>
                </div>
                <div className="terminal-socials">
                  <a href="https://github.com/arunherga" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
                  <a href="https://www.linkedin.com/in/arunbbhat/" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
                  <a href="mailto:arun.b.bhat@gmail.com">Email ↗</a>
                </div>
              </div>
              <div className="terminal-status"><span>● SYSTEM ONLINE</span><span>ARUN BALAKRISHNA BHAT</span></div>
            </div>
            <div className="terminal-pane terminal-console">
              <div className="terminal-bar"><span className="window-dots" aria-hidden="true"><i /><i /><i /></span><span>terminal — bash</span></div>
              <div className="terminal-console-body" onClick={() => inputRef.current?.focus()}>
                <div className="terminal-wordmark" aria-hidden="true">AB<span>.</span></div>
                <p>Welcome to Arun Balakrishna Bhat&apos;s portfolio terminal.<br />Type <b>help</b> for commands.</p>
                <div className="terminal-history" aria-live="polite">
                  {entries.map((entry, index) => (
                    <div className="terminal-entry" key={`${entry.command}-${index}`}>
                      <p><span>arun@portfolio:~$</span> {entry.command}</p>
                      <pre>{entry.output}</pre>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
              </div>
              <form className="terminal-prompt" onSubmit={runCommand}>
                <label htmlFor="portfolio-command">arun@portfolio:~$</label>
                <input id="portfolio-command" ref={inputRef} value={input} onChange={(event) => setInput(event.target.value)} autoComplete="off" spellCheck={false} aria-label="Terminal command" placeholder="Type a command..." />
                <span className="terminal-input-cursor" aria-hidden="true" />
              </form>
              <div className="terminal-status"><span>● SYSTEM ONLINE</span><span>ESC TO CLOSE</span></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
