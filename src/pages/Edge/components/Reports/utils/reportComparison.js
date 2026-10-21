export const reportDate = (date) => {
  if (!date) return "";
  if (typeof date === "string") return date.slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

const localDate = (value) => {
  const [year, month, day] = reportDate(value).split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const comparisonDates = (dateRange, comparison) => {
  if (!comparison || !dateRange?.[0] || !dateRange?.[1]) return null;
  if (comparison.mode === "CUSTOM") return comparison.range;
  const start = localDate(dateRange[0]);
  const end = localDate(dateRange[1]);
  if (comparison.mode === "LAST_YEAR") {
    // Clamp leap day to the final day of the same month in the previous year.
    return [start, end].map((date) => {
      const year = date.getFullYear() - 1;
      const day = Math.min(date.getDate(), new Date(year, date.getMonth() + 1, 0).getDate());
      return reportDate(new Date(year, date.getMonth(), day));
    });
  }
  // Count calendar days in UTC so daylight-saving transitions do not change period length.
  const dayNumber = (date) => Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000;
  const days = dayNumber(end) - dayNumber(start) + 1;
  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  start.setDate(start.getDate() - days);
  return [reportDate(start), reportDate(previousEnd)];
};

export const rangeLabel = (range) => range?.map(reportDate).join(" to ") || "";
