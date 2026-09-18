import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public", "activity");
const currentYear = new Date().getUTCFullYear();

async function saveSnapshot(file, load) {
  try {
    const data = await load();
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, `${JSON.stringify(data)}\n`, "utf8");
    console.log(`Updated ${path.relative(process.cwd(), file)}`);
  } catch (error) {
    try {
      await access(file);
      console.warn(`Keeping prior ${path.relative(process.cwd(), file)}: ${error.message}`);
    } catch {
      throw error;
    }
  }
}

async function fetchGitHubCalendar() {
  const response = await fetch("https://github.com/users/arunherga/contributions", {
    headers: { Accept: "text/html", "User-Agent": "arunbhat.com portfolio" },
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

  const html = await response.text();
  const days = [];
  const cells = html.matchAll(
    /<td\b([^>]*\bclass="ContributionCalendar-day"[^>]*)><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g,
  );
  for (const [, attributes, tooltip] of cells) {
    const date = attributes.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const level = Number(attributes.match(/\bdata-level="([0-4])"/)?.[1]);
    const count = Number(tooltip.match(/^(\d[\d,]*) contributions?/)?.[1].replaceAll(",", "") ?? 0);
    if (date && Number.isFinite(level) && Number.isFinite(count)) days.push({ date, count, level });
  }
  if (days.length < 350) throw new Error("GitHub contribution format changed");
  days.sort((a, b) => a.date.localeCompare(b.date));
  return {
    days,
    total: days.reduce((sum, day) => sum + day.count, 0),
    from: days[0].date,
    to: days[days.length - 1].date,
  };
}

const leetCodeQuery = `
  query portfolioActivity($username: String!, $year: Int) {
    matchedUser(username: $username) {
      submitStatsGlobal { acSubmissionNum { difficulty count } }
      userCalendar(year: $year) {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

async function fetchLeetCodeYear(year) {
  const response = await fetch("https://leetcode.com/graphql", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Referer: "https://leetcode.com/u/arunHerga/",
      "User-Agent": "Mozilla/5.0 (compatible; arunbhat.com portfolio)",
    },
    body: JSON.stringify({ query: leetCodeQuery, variables: { username: "arunHerga", year } }),
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`LeetCode returned ${response.status}`);
  const result = await response.json();
  const user = result.data?.matchedUser;
  const calendar = user?.userCalendar;
  if (!user || !calendar?.submissionCalendar) throw new Error("LeetCode calendar unavailable");
  const rawDays = JSON.parse(calendar.submissionCalendar);
  const days = Object.entries(rawDays)
    .map(([timestamp, count]) => ({
      date: new Date(Number(timestamp) * 1000).toISOString().slice(0, 10),
      count: Number(count),
    }))
    .filter((day) => day.date.startsWith(`${year}-`) && Number.isFinite(day.count))
    .sort((a, b) => a.date.localeCompare(b.date));
  const solved = Object.fromEntries(
    (user.submitStatsGlobal?.acSubmissionNum ?? []).map((entry) => [entry.difficulty.toLowerCase(), entry.count]),
  );
  return {
    year,
    days,
    submissions: days.reduce((sum, day) => sum + day.count, 0),
    activeDays: calendar.totalActiveDays ?? days.length,
    streak: calendar.streak ?? 0,
    activeYears: calendar.activeYears ?? [],
    solved,
  };
}

await saveSnapshot(path.join(root, "github.json"), fetchGitHubCalendar);
const currentFile = path.join(root, "leetcode", `${currentYear}.json`);
let currentData;
await saveSnapshot(currentFile, async () => {
  currentData = await fetchLeetCodeYear(currentYear);
  return currentData;
});
if (!currentData) currentData = JSON.parse(await readFile(currentFile, "utf8"));
const years = [...new Set(currentData.activeYears)]
  .filter((year) => Number.isInteger(year) && year >= 2022 && year < currentYear);
for (const year of years) {
  await saveSnapshot(path.join(root, "leetcode", `${year}.json`), () => fetchLeetCodeYear(year));
}
