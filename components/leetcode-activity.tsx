"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Code2 } from "lucide-react";
import { ActivityCalendar } from "./activity-calendar";

type LeetCodeData = {
  year: number;
  days: Array<{ date: string; count: number }>;
  submissions: number;
  activeDays: number;
  streak: number;
  activeYears: number[];
  solved: Record<string, number>;
};

const currentYear = new Date().getUTCFullYear();

export function LeetCodeActivity() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<LeetCodeData | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        const response = await fetch(`/api/activity/leetcode?year=${year}`, { signal: controller.signal });
        if (!response.ok) throw new Error("LeetCode activity unavailable");
        const result = (await response.json()) as LeetCodeData;
        if (!Array.isArray(result.days) || !Array.isArray(result.activeYears)) {
          throw new Error("Unexpected LeetCode response");
        }

        if (!autoSelected && year === currentYear && result.submissions === 0) {
          const latestActiveYear = Math.max(...result.activeYears.filter((activeYear) => activeYear < currentYear));
          if (Number.isFinite(latestActiveYear)) {
            setAutoSelected(true);
            setYear(latestActiveYear);
            return;
          }
        }

        setData(result);
        setUnavailable(false);
      } catch {
        if (!controller.signal.aborted) setUnavailable(true);
      }
    }

    load();
    return () => controller.abort();
  }, [year, autoSelected]);

  const years = Array.from(new Set([currentYear, ...(data?.activeYears ?? [])]))
    .filter((value) => value >= 2022 && value <= currentYear)
    .sort((a, b) => b - a);
  const today = new Date().toISOString().slice(0, 10);
  const calendarEnd = year === currentYear ? today : `${year}-12-31`;

  return (
    <div className="github-activity leetcode-activity">
      <div className="activity-heading">
        <div className="activity-icon"><Code2 size={22} strokeWidth={1.7} /></div>
        <div>
          <span className="activity-kicker">LIVE FROM LEETCODE</span>
          <h3>Problem solving</h3>
        </div>
        <a href="https://leetcode.com/u/arunHerga/" target="_blank" rel="noopener noreferrer">
          View profile <ArrowUpRight size={17} />
        </a>
      </div>

      {data ? (
        <>
          <div className="leetcode-stats">
            <div className="leetcode-total"><strong>{data.solved.all ?? 0}</strong><span>problems solved</span></div>
            <div><strong>{data.solved.easy ?? 0}</strong><span>Easy</span></div>
            <div><strong>{data.solved.medium ?? 0}</strong><span>Medium</span></div>
            <div><strong>{data.solved.hard ?? 0}</strong><span>Hard</span></div>
          </div>

          <div className="leetcode-calendar-heading">
            <div>
              <strong>{data.submissions} submission{data.submissions === 1 ? "" : "s"} in {year}</strong>
              <span>{data.activeDays} active day{data.activeDays === 1 ? "" : "s"} · {data.streak} day streak</span>
            </div>
            <label>Year <select value={year} onChange={(event) => { setData(null); setYear(Number(event.target.value)); }}>
              {years.map((availableYear) => <option key={availableYear} value={availableYear}>{availableYear}</option>)}
            </select></label>
          </div>
          <ActivityCalendar
            days={data.days}
            startDate={`${year}-01-01`}
            endDate={calendarEnd}
            label={`${data.submissions} LeetCode submission${data.submissions === 1 ? "" : "s"} in ${year} across ${data.activeDays} active day${data.activeDays === 1 ? "" : "s"}`}
            unit="submission"
            tone="leetcode"
          />
        </>
      ) : (
        <p className="activity-empty" aria-live="polite">
          {unavailable ? "LeetCode activity is temporarily unavailable. You can still view the profile." : "Loading LeetCode activity…"}
        </p>
      )}
      <p className="activity-note">Only public LeetCode activity appears here.</p>
    </div>
  );
}
