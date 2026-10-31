// Small helpers shared by the billing pages.

/** 99 -> "$99.00"; null/undefined -> a dash. */
export const money = (value) =>
  value === null || value === undefined || value === ""
    ? "—"
    : `$${Number(value).toLocaleString("en-AU", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const periodLabel = (year, month) => `${MONTHS[month - 1]} ${year}`;

/** The current month as an <input type="month"> value, "2026-11". */
export const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

/** "2026-11" -> { year: 2026, month: 11 }, or null while the field is empty or half typed. */
export const parseMonthValue = (value) => {
  const match = /^(\d{4})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  return month >= 1 && month <= 12 ? { year, month } : null;
};

/** A rate typed in a box: blank means "not set", otherwise a number of dollars and cents. */
export const parseRateInput = (text) => {
  const trimmed = (text || "").trim();
  if (trimmed === "") return { value: null };
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(trimmed) || Number(trimmed) > 100000) {
    return { error: "Enter an amount from 0 to 100000 with at most two decimal places." };
  }
  return { value: Number(trimmed) };
};

/** Stops a spreadsheet running a cell that starts like a formula. */
const csvCell = (value) => {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
};

/** The record as CSV: one row per billed user, with the site each is billed under. */
export const recordCsv = (detail) => {
  const { record, sites } = detail;
  const rows = [["Company", "Period", "Site", "Username", "Name", "Role", "Tier", "Monthly rate"]];
  sites.forEach((site) =>
    site.users.forEach((u) =>
      rows.push([
        record.companyName,
        periodLabel(record.year, record.month),
        site.siteName,
        u.userName,
        u.fullName,
        u.roleName,
        u.tier === "POWER" ? "Power" : "Standard",
        Number(u.rate).toFixed(2),
      ])
    )
  );
  return rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
};

export const downloadText = (filename, text) => {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
