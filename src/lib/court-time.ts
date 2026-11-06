/** Barangay time (Asia/Manila, UTC+8), independent of the viewer's device clock zone. */
export function manilaNow(nowMs = Date.now()) {
  const iso = new Date(nowMs + 8 * 3600_000).toISOString();
  return { date: iso.slice(0, 10), time: iso.slice(11, 16) };
}

/** A slot can't be booked once its start time has passed (e.g. 6:00 PM slot at 7:00 PM same day). */
export function isSlotPast(date: string, slot: string, now = manilaNow()): boolean {
  return date < now.date || (date === now.date && slot <= now.time);
}
