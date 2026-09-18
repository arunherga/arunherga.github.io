import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type ContributionDay = { date: string; count: number; level: number };

export async function GET() {
  try {
    const response = await fetch("https://github.com/users/arunherga/contributions", {
      headers: { Accept: "text/html" },
    });
    if (!response.ok) throw new Error(`GitHub returned ${response.status}`);

    const html = await response.text();
    const days: ContributionDay[] = [];
    const cells = html.matchAll(
      /<td\b([^>]*\bclass="ContributionCalendar-day"[^>]*)><\/td>\s*<tool-tip\b[^>]*>([^<]*)<\/tool-tip>/g,
    );

    for (const [, attributes, tooltip] of cells) {
      const date = attributes.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
      const level = Number(attributes.match(/\bdata-level="([0-4])"/)?.[1]);
      const count = Number(tooltip.match(/^(\d[\d,]*) contributions?/)?.[1].replaceAll(",", "") ?? 0);
      if (date && Number.isFinite(level) && Number.isFinite(count)) {
        days.push({ date, count, level });
      }
    }

    if (days.length < 350) throw new Error("GitHub calendar format changed");
    days.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json(
      {
        days,
        total: days.reduce((sum, day) => sum + day.count, 0),
        from: days[0].date,
        to: days[days.length - 1].date,
      },
      { headers: { "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600" } },
    );
  } catch {
    return NextResponse.json({ error: "GitHub calendar unavailable" }, { status: 502 });
  }
}
