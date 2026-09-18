import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const query = `
  query portfolioActivity($username: String!, $year: Int) {
    matchedUser(username: $username) {
      submitStatsGlobal {
        acSubmissionNum { difficulty count }
      }
      userCalendar(year: $year) {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

type LeetCodeResponse = {
  data?: {
    matchedUser?: {
      submitStatsGlobal?: { acSubmissionNum?: Array<{ difficulty: string; count: number }> };
      userCalendar?: {
        activeYears?: number[];
        streak?: number;
        totalActiveDays?: number;
        submissionCalendar?: string;
      };
    } | null;
  };
};

export async function GET(request: NextRequest) {
  const currentYear = new Date().getUTCFullYear();
  const year = Number(request.nextUrl.searchParams.get("year") ?? currentYear);
  if (!Number.isInteger(year) || year < 2022 || year > currentYear) {
    return NextResponse.json({ error: "Invalid year" }, { status: 400 });
  }

  try {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Referer: "https://leetcode.com/u/arunHerga/",
      },
      body: JSON.stringify({ query, variables: { username: "arunHerga", year } }),
    });
    if (!response.ok) throw new Error(`LeetCode returned ${response.status}`);

    const result = (await response.json()) as LeetCodeResponse;
    const user = result.data?.matchedUser;
    const calendar = user?.userCalendar;
    if (!user || !calendar?.submissionCalendar) throw new Error("LeetCode data unavailable");

    const rawDays = JSON.parse(calendar.submissionCalendar) as Record<string, number>;
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

    return NextResponse.json(
      {
        year,
        days,
        submissions: days.reduce((sum, day) => sum + day.count, 0),
        activeDays: calendar.totalActiveDays ?? days.length,
        streak: calendar.streak ?? 0,
        activeYears: calendar.activeYears ?? [],
        solved,
      },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ error: "LeetCode activity unavailable" }, { status: 502 });
  }
}
