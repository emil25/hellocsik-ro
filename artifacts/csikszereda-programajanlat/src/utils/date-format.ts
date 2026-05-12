import { format, isToday } from "date-fns";
import { hu } from "date-fns/locale";

/**
 * All event times are stored as UTC but represent Romania local times
 * (the admin enters "10:00" meaning 10:00 Romania time, stored as 10:00 UTC).
 * So we always display the UTC time values directly, without timezone conversion.
 */
function asUTC(dateString: string): Date {
  const d = new Date(dateString);
  return new Date(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),
    d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()
  );
}

export function formatDate(dateString: string) {
  try {
    return format(asUTC(dateString), "yyyy. MMMM d., HH:mm", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function formatShortDate(dateString: string) {
  try {
    return format(asUTC(dateString), "MMM d.", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function formatTime(dateString: string) {
  try {
    return format(asUTC(dateString), "HH:mm", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function formatDayName(dateString: string) {
  try {
    return format(asUTC(dateString), "EEEE", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function isDateToday(dateString: string) {
  try {
    return isToday(asUTC(dateString));
  } catch (e) {
    return false;
  }
}
