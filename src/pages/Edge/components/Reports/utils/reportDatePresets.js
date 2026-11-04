import { getOfficeToday } from "../../../utils/utilFunc";
import { getFinancialYearRange } from "../../../utils/financialYear";

// Date preset helper calculating standard fiscal / calendar periods
export const getDatePresetRange = (preset, siteInfo) => {
  const [year, month, day] = getOfficeToday(siteInfo?.timeZone).split("-").map(Number);
  const now = new Date(year, month - 1, day);
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
  const endOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

  switch (preset) {
    case "THIS_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case "LAST_MONTH": {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case "THIS_QUARTER": {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      const start = new Date(now.getFullYear(), qMonth, 1);
      const end = new Date(now.getFullYear(), qMonth + 3, 0);
      return [startOfDay(start), endOfDay(end)];
    }
    case "CALENDAR_YEAR": {
      // Calendar Year: 1 January to 31 December
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date(now.getFullYear(), 11, 31);
      return [startOfDay(start), endOfDay(end)];
    }
    case "FINANCIAL_YEAR": {
      // The recurring site boundary determines the full financial year containing today.
      return getFinancialYearRange(siteInfo);
    }
    case "LAST_30_DAYS": {
      const start = new Date(now);
      start.setDate(start.getDate() - 30);
      return [startOfDay(start), endOfDay(now)];
    }
    case "ALL_TIME":
    default:
      return [null, null];
  }
};

