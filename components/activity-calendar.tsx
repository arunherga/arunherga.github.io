type ActivityDay = { date: string; count: number; level?: number };

type ActivityCalendarProps = {
  days: ActivityDay[];
  startDate: string;
  endDate: string;
  label: string;
  unit: string;
  tone: "github" | "leetcode";
};

const dayMilliseconds = 24 * 60 * 60 * 1000;

function utcDate(value: string) {
  return new Date(`${value}T00:00:00Z`);
}

function dateLabel(date: Date) {
  return date.toLocaleDateString("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ActivityCalendar({ days, startDate, endDate, label, unit, tone }: ActivityCalendarProps) {
  const first = utcDate(startDate);
  const last = utcDate(endDate);
  const gridStart = new Date(first.getTime() - first.getUTCDay() * dayMilliseconds);
  const gridEnd = new Date(last.getTime() + (6 - last.getUTCDay()) * dayMilliseconds);
  const weeks = Math.round((gridEnd.getTime() - gridStart.getTime()) / (7 * dayMilliseconds)) + 1;
  const byDate = new Map(days.map((day) => [day.date, day]));
  const cells = [];
  const months = [];

  for (let timestamp = gridStart.getTime(); timestamp <= gridEnd.getTime(); timestamp += dayMilliseconds) {
    const date = new Date(timestamp);
    const key = date.toISOString().slice(0, 10);
    const inside = timestamp >= first.getTime() && timestamp <= last.getTime();
    const activity = byDate.get(key);
    const count = activity?.count ?? 0;
    const level = activity?.level ?? (count >= 7 ? 4 : count >= 4 ? 3 : count >= 2 ? 2 : count ? 1 : 0);

    if (inside && (key === startDate || date.getUTCDate() === 1)) {
      months.push({
        key,
        label: date.toLocaleDateString("en", { month: "short", timeZone: "UTC" }),
        column: Math.floor((timestamp - gridStart.getTime()) / (7 * dayMilliseconds)) + 1,
      });
    }

    cells.push(
      <span
        key={key}
        className={`heatmap-day${inside ? "" : " is-outside"}`}
        data-level={inside ? level : 0}
        title={inside ? `${count} ${unit}${count === 1 ? "" : "s"} on ${dateLabel(date)}` : undefined}
        aria-hidden="true"
      />,
    );
  }

  const columns = { gridTemplateColumns: `repeat(${weeks}, var(--heatmap-cell))` };

  return (
    <div className={`activity-calendar ${tone}`} role="img" aria-label={label}>
      <div className="calendar-scroll">
        <div className="calendar-content">
          <div className="calendar-weekdays" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div>
          <div>
            <div className="calendar-months" style={columns} aria-hidden="true">
              {months.map((month) => <span key={month.key} style={{ gridColumnStart: month.column }}>{month.label}</span>)}
            </div>
            <div className="calendar-grid" style={columns} aria-hidden="true">{cells}</div>
          </div>
        </div>
      </div>
      <div className="calendar-legend" aria-hidden="true">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => <i key={level} data-level={level} />)}
        <span>More</span>
      </div>
    </div>
  );
}
