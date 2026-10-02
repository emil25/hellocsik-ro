import { format, isToday } from "date-fns";
import { hu } from "date-fns/locale";

/**
 * API dates are real instants. Display them in the event's Romanian timezone,
 * independently of the visitor's timezone, including daylight-saving time.
 */
function asUTC(dateString: string): Date {
  const d = new Date(new Date(dateString).toLocaleString("sv-SE", { timeZone: "Europe/Bucharest" }).replace(" ", "T"));
  return new Date(
    d.getFullYear(), d.getMonth(), d.getDate(),
    d.getHours(), d.getMinutes(), d.getSeconds()
  );
}

export function formatDate(dateString: string) {
  try {
    return format(asUTC(dateString), "yyyy. MMMM d., HH:mm", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function formatEndDate(dateString: string) {
  try {
    const date = asUTC(dateString);
    // A date-only closing day is stored at the day's final second for expiry.
    if (date.getHours() === 23 && date.getMinutes() === 59 && date.getSeconds() === 59) {
      return `${format(date, "yyyy. MMMM d", { locale: hu })}-ig`;
    }
    return formatDate(dateString);
  } catch {
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
