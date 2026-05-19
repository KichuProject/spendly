const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function parseDateSafely(date) {
  if (!date) return new Date();
  if (date instanceof Date) return new Date(date.getTime());
  if (typeof date === 'string') {
    // If it's a simple YYYY-MM-DD date key, manually parse parts to guarantee platform compatibility
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      const parts = date.split('-');
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
  }
  return new Date(date);
}

export function formatDate(date) {
  const d = parseDateSafely(date);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatDateLong(date) {
  const d = parseDateSafely(date);
  return `${DAYS_FULL[d.getDay()]}, ${d.getDate()} ${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatMonthYear(date) {
  const d = parseDateSafely(date);
  return `${MONTHS_FULL[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatShortDate(date) {
  const d = parseDateSafely(date);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function getDayNumber(date) {
  return parseDateSafely(date).getDate();
}

export function getMonthShort(date) {
  return MONTHS[parseDateSafely(date).getMonth()];
}

export function getDayName(date) {
  return DAYS_FULL[parseDateSafely(date).getDay()];
}

export function getDayNameShort(date) {
  return DAYS[parseDateSafely(date).getDay()];
}

export function isToday(date) {
  const d = parseDateSafely(date);
  const t = new Date();
  return d.getDate() === t.getDate() && d.getMonth() === t.getMonth() && d.getFullYear() === t.getFullYear();
}

export function isPast(date) {
  const d = parseDateSafely(date);
  d.setHours(23, 59, 59, 999);
  return d < new Date();
}

export function isFuture(date) {
  const d = parseDateSafely(date);
  d.setHours(0, 0, 0, 0);
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return d > t;
}

export function isSameDay(d1, d2) {
  const a = parseDateSafely(d1);
  const b = parseDateSafely(d2);
  return a.getDate() === b.getDate() && a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear();
}

export function toDateKey(date) {
  const d = parseDateSafely(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getStartOfDay(date) {
  const d = parseDateSafely(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfWeek(date) {
  const d = parseDateSafely(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getStartOfMonth(date) {
  const d = parseDateSafely(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfMonth(date) {
  const d = parseDateSafely(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getDateRange(filter, customRange, installDate) {
  const now = new Date();
  let range;

  switch (filter) {
    case 'past7': {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
      range = { start, end: now };
      break;
    }
    case 'today':
      range = { start: getStartOfDay(now), end: now };
      break;
    case 'week': {
      range = { start: getStartOfWeek(now), end: now };
      break;
    }
    case 'month':
      range = { start: getStartOfMonth(now), end: now };
      break;
    case 'custom':
      if (customRange && customRange.start && customRange.end) {
        range = { start: parseDateSafely(customRange.start), end: parseDateSafely(customRange.end) };
      } else {
        range = { start: getStartOfMonth(now), end: now };
      }
      break;
    case 'all':
    default:
      range = { start: new Date(2020, 0, 1), end: now };
      break;
  }

  // Clamp starting date to the installDate so we never calculate older than installation
  if (installDate) {
    const inst = getStartOfDay(installDate);
    if (range.start < inst) {
      range.start = inst;
    }
  }

  return range;
}

export function getDaysInRange(startDate, endDate) {
  const days = [];
  const start = getStartOfDay(startDate);
  const end = getStartOfDay(endDate);
  const current = new Date(end);
  while (current >= start) {
    days.push(new Date(current));
    current.setDate(current.getDate() - 1);
  }
  return days;
}

export function formatTime(date) {
  const d = new Date(date);
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getCalendarGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = getDaysInMonth(year, month);
  const grid = [];
  let week = new Array(firstDay).fill(null);
  for (let d = 1; d <= totalDays; d++) {
    week.push(d);
    if (week.length === 7) {
      grid.push(week);
      week = [];
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null);
    grid.push(week);
  }
  return grid;
}
