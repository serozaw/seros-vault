import { fromZonedTime } from "date-fns-tz";
import { BOOKING_CONFIG } from "./booking-config";

export type Slot = { startsAt: Date; label: string };

/**
 * Whether the given calendar date ("YYYY-MM-DD", in BOOKING_CONFIG's
 * timezone) falls inside one of BOOKING_CONFIG.blockedRanges. Used both to
 * hide slots for that day (client + server) and, separately, to reject a
 * booking attempt server-side even if someone calls the API directly.
 */
export function getBlockedRange(dateStr: string) {
  return BOOKING_CONFIG.blockedRanges.find((r) => dateStr >= r.start && dateStr <= r.end);
}

/**
 * Generates candidate slot start times (as real UTC instants) for a given
 * calendar day, in the business's configured timezone, then filters out
 * anything in the past or that would run past closing given the package
 * duration or that overlaps a busy range or a blocked date range.
 */
export function generateSlotsForDay(
  dateStr: string, // "YYYY-MM-DD"
  durationMinutes: number,
  busy: { startsAt: string; endsAt: string }[]
): Slot[] {
  if (getBlockedRange(dateStr)) return [];

  const { timezone, startHour, endHour, slotIntervalMinutes } = BOOKING_CONFIG;
  const slots: Slot[] = [];

  for (let minutes = startHour * 60; minutes + durationMinutes <= endHour * 60; minutes += slotIntervalMinutes) {
    const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
    const mm = String(minutes % 60).padStart(2, "0");
    const wallClock = `${dateStr}T${hh}:${mm}:00`;
    const startsAt = fromZonedTime(wallClock, timezone);
    const endsAt = new Date(startsAt.getTime() + durationMinutes * 60_000);

    if (startsAt.getTime() < Date.now()) continue;

    const overlaps = busy.some((b) => {
      const bStart = new Date(b.startsAt).getTime();
      const bEnd = new Date(b.endsAt).getTime();
      return startsAt.getTime() < bEnd && endsAt.getTime() > bStart;
    });
    if (overlaps) continue;

    slots.push({
      startsAt,
      label: startsAt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }),
    });
  }

  return slots;
}
