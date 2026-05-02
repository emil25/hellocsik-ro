import { format, isToday, parseISO } from "date-fns";
import { hu } from "date-fns/locale";

export function formatDate(dateString: string) {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, "yyyy. MMMM d., HH:mm", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function formatShortDate(dateString: string) {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, "MMM d.", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function formatTime(dateString: string) {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, "HH:mm", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function formatDayName(dateString: string) {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return format(date, "EEEE", { locale: hu });
  } catch (e) {
    return dateString;
  }
}

export function isDateToday(dateString: string) {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    return isToday(date);
  } catch (e) {
    return false;
  }
}
