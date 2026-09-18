"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Code2 } from "lucide-react";

type GitHubEvent = {
  id: string;
  type: string;
  created_at: string;
  repo?: { name?: string };
};

const activityLabels: Record<string, string> = {
  PushEvent: "Pushed code to",
  PullRequestEvent: "Contributed a pull request to",
  PullRequestReviewEvent: "Reviewed a pull request in",
  IssuesEvent: "Worked on an issue in",
  CreateEvent: "Created something in",
  ReleaseEvent: "Published a release in",
};

export function GitHubActivity({ username }: { username: string }) {
  const [events, setEvents] = useState<GitHubEvent[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const profileUrl = `https://github.com/${encodeURIComponent(username)}`;

  useEffect(() => {
    const controller = new AbortController();

    async function loadActivity() {
      try {
        const response = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
          {
            headers: { Accept: "application/vnd.github+json" },
            signal: controller.signal,
          },
        );
        if (!response.ok) throw new Error("GitHub activity unavailable");
        const result: unknown = await response.json();
        if (!Array.isArray(result)) throw new Error("Unexpected GitHub response");
        setEvents(
          (result as GitHubEvent[])
            .filter((event) => activityLabels[event.type] && event.repo?.name)
            .slice(0, 5),
        );
      } catch {
        if (!controller.signal.aborted) setUnavailable(true);
      }
    }

    loadActivity();
    return () => controller.abort();
  }, [username]);

  return (
    <div className="github-activity">
      <div className="activity-heading">
        <div className="activity-icon"><Code2 size={22} strokeWidth={1.7} /></div>
        <div>
          <span className="activity-kicker">LIVE FROM GITHUB</span>
          <h3>Recent public activity</h3>
        </div>
        <a href={profileUrl} target="_blank" rel="noopener noreferrer" aria-label="View Arun's GitHub profile">
          View profile <ArrowUpRight size={17} />
        </a>
      </div>

      {events?.length ? (
        <ul className="activity-list">
          {events.map((event) => {
            const repository = event.repo!.name!;
            const [owner, name] = repository.split("/");
            const repositoryUrl = owner && name
              ? `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`
              : profileUrl;
            return (
              <li key={event.id}>
                <span className="activity-dot" aria-hidden="true" />
                <div>
                  <span>{activityLabels[event.type]} </span>
                  <a href={repositoryUrl} target="_blank" rel="noopener noreferrer">{repository}</a>
                </div>
                <time dateTime={event.created_at}>
                  {new Date(event.created_at).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" })}
                </time>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="activity-empty" aria-live="polite">
          {unavailable
            ? "Activity is temporarily unavailable. You can still view the GitHub profile."
            : events
              ? "No recent public activity to show. Explore the GitHub profile for more."
              : "Loading recent public activity…"}
        </p>
      )}
      <p className="activity-note">Only public GitHub activity appears here. Updates may take a while to show.</p>
    </div>
  );
}
