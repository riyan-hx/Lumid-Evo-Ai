const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** “Tuesday, 29 Sep” + greeting (device timezone). */
export function today(now = new Date()) {
  const date = `${DAYS[now.getDay()]}, ${now.getDate()} ${MONTHS[now.getMonth()]}`;
  const h = now.getHours();
  const greeting = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return { date, greeting };
}

/** 12-hour clock, e.g. “6:45 PM”. */
export function clock(d: Date) {
  const h = d.getHours();
  return `${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
}

export function inMinutes(m: number) {
  const d = new Date();
  d.setMinutes(d.getMinutes() + m);
  return d;
}
