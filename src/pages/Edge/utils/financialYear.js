import moment from "moment-timezone";

const isBlank = (value) => value == null || value === "";

export const validateFinancialYearStart = ({ financialYearStartDay: day, financialYearStartMonth: month }) => {
  if (isBlank(day) && isBlank(month)) return null;
  const validMonth = Number.isInteger(Number(month)) && Number(month) >= 1 && Number(month) <= 12;
  const maxDay = validMonth ? new Date(2000, Number(month), 0).getDate() : 0;
  if (isBlank(day) || isBlank(month) || !validMonth || !Number.isInteger(Number(day))
      || Number(day) < 1 || Number(day) > maxDay) {
    return "Provide a valid financial year start day and month together, or leave both blank.";
  }
  return null;
};

export const getFinancialYearRange = (siteInfo = {}) => {
  const configured = siteInfo.financialYearStartDay != null && siteInfo.financialYearStartDay !== ""
    && siteInfo.financialYearStartMonth != null && siteInfo.financialYearStartMonth !== ""
    && !validateFinancialYearStart(siteInfo);
  const day = configured ? Number(siteInfo.financialYearStartDay) : 1;
  const month = configured ? Number(siteInfo.financialYearStartMonth) : 7;
  const timeZone = moment.tz.zone(siteInfo.timeZone) ? siteInfo.timeZone : "Australia/Sydney";
  const now = moment().tz(timeZone);
  // Compare calendar dates in the site's timezone, while keeping picker values free of UTC shifts.
  const today = new Date(now.year(), now.month(), now.date());
  const annualStart = (year) => new Date(year, month - 1,
    Math.min(day, new Date(year, month, 0).getDate()));
  let startYear = now.year();
  if (today < annualStart(startYear)) startYear -= 1;
  const start = annualStart(startYear);
  const end = annualStart(startYear + 1);
  end.setDate(end.getDate() - 1);
  end.setHours(23, 59, 59, 999);
  return [start, end];
};
