/**
 * Date Utilities
 * Helper functions for date manipulation
 */

/**
 * Convert date to YYYY-MM-DD format
 */
const toDateKey = (date) => {
  const d = new Date(date);
  const kolkataStr = d.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const kDate = new Date(kolkataStr);
  const year = kDate.getFullYear();
  const month = String(kDate.getMonth() + 1).padStart(2, '0');
  const day = String(kDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get start of day (00:00:00) in Asia/Kolkata (represented as UTC Date object)
 */
const getStartOfDay = (date = new Date()) => {
  const kolkataStr = new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const kDate = new Date(kolkataStr);
  kDate.setHours(0, 0, 0, 0);
  const offsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(kDate.getTime() - offsetMs);
};

/**
 * Get end of day (23:59:59) in Asia/Kolkata (represented as UTC Date object)
 */
const getEndOfDay = (date = new Date()) => {
  const kolkataStr = new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const kDate = new Date(kolkataStr);
  kDate.setHours(23, 59, 59, 999);
  const offsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(kDate.getTime() - offsetMs);
};

/**
 * Get start of week (Monday) in Asia/Kolkata (represented as UTC Date object)
 */
const getStartOfWeek = (date = new Date()) => {
  const kolkataStr = new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const kDate = new Date(kolkataStr);
  const day = kDate.getDay();
  const diff = kDate.getDate() - day + (day === 0 ? -6 : 1);
  kDate.setDate(diff);
  kDate.setHours(0, 0, 0, 0);
  const offsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(kDate.getTime() - offsetMs);
};

/**
 * Get start of month in Asia/Kolkata (represented as UTC Date object)
 */
const getStartOfMonth = (date = new Date()) => {
  const kolkataStr = new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const kDate = new Date(kolkataStr);
  kDate.setDate(1);
  kDate.setHours(0, 0, 0, 0);
  const offsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(kDate.getTime() - offsetMs);
};

/**
 * Get end of month in Asia/Kolkata (represented as UTC Date object)
 */
const getEndOfMonth = (date = new Date()) => {
  const kolkataStr = new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const kDate = new Date(kolkataStr);
  kDate.setMonth(kDate.getMonth() + 1);
  kDate.setDate(0);
  kDate.setHours(23, 59, 59, 999);
  const offsetMs = 5.5 * 60 * 60 * 1000;
  return new Date(kDate.getTime() - offsetMs);
};

/**
 * Check if two dates are the same day
 */
const isSameDay = (date1, date2) => {
  return toDateKey(date1) === toDateKey(date2);
};

/**
 * Get days in a date range
 */
const getDaysInRange = (startDate, endDate) => {
  const days = [];
  const current = new Date(getStartOfDay(startDate));
  const end = new Date(getStartOfDay(endDate));

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
};

/**
 * Get past N days
 */
const getPastNDays = (n = 7) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - n + 1);
  return getDaysInRange(start, end);
};

/**
 * Add days to date
 */
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

/**
 * Add hours to date
 */
const addHours = (date, hours) => {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
};
/**
 * Parse date safely, falling back to current date if invalid
 */
const parseDateSafely = (date) => {
  if (!date) return new Date();
  const d = new Date(date);
  return isNaN(d.getTime()) ? new Date() : d;
};

module.exports = {
  toDateKey,
  getStartOfDay,
  getEndOfDay,
  getStartOfWeek,
  getStartOfMonth,
  getEndOfMonth,
  isSameDay,
  getDaysInRange,
  getPastNDays,
  addDays,
  addHours,
  parseDateSafely,
};
