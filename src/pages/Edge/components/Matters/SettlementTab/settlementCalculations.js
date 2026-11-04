// Money is integer cents; rational calculations round once per adjustment, half up.
const MAX_CENTS = 99999999999999n;
const DAY = 86400000;
export const CATEGORIES = {
  COUNCIL_RATES: "Council Rates",
  WATER_RATES: "Water Rates",
  STRATA_LEVIES: "Strata Levies",
  LAND_TAX: "Land Tax",
  PENALTY_INTEREST: "Penalty Interest",
  WATER_USAGE: "Water Usage",
  MORTGAGE_DISCHARGE: "Mortgage Discharge Fees",
  UNIT_ENTITLEMENT: "Other adjustment - Unit Entitlement",
  OTHER: "Other Adjustment",
};
const money = (value, label) => {
  const text = String(value ?? "").trim();
  if (!/^\d{1,12}(\.\d{0,2})?$/.test(text))
    throw new Error(
      `${label}: enter a non-negative amount with up to two decimal places.`,
    );
  const [whole, fraction = ""] = text.split(".");
  const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, "0"));
  if (cents > MAX_CENTS) throw new Error(`${label}: amount is too large.`);
  return cents;
};
const decimal = (value) =>
  `${value < 0n ? "-" : ""}${(value < 0n ? -value : value) / 100n}.${String((value < 0n ? -value : value) % 100n).padStart(2, "0")}`;
// HALF_UP must round negative prorated results symmetrically, away from zero at a half cent.
const divide = (numerator, denominator) => numerator < 0n
  ? -((-numerator + denominator / 2n) / denominator)
  : (numerator + denominator / 2n) / denominator;
const dateDay = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || ""))
    throw new Error("Enter valid calendar dates.");
  const time = Date.parse(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(time) ||
    new Date(time).toISOString().slice(0, 10) !== value ||
    value < "1900-01-01" ||
    value > "2200-12-31"
  )
    throw new Error("Dates must be between 1900 and 2200.");
  return time / DAY;
};

/** Six-place quantities remain integer ratios throughout allowance calculations. */
const quantity = (value, label, positive = false) => {
  const text = String(value ?? "");
  if (!/^\d{1,12}(\.\d{0,6})?$/.test(text))
    throw new Error(
      `${label}: enter a non-negative number with up to six decimal places.`,
    );
  const [whole, fraction = ""] = text.split(".");
  const scaled = BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, "0"));
  if (scaled > 999999999999n * 1000000n || (positive && scaled === 0n))
    throw new Error(
      `${label}: enter ${positive ? "a positive" : "a supported"} value up to 999,999,999,999.`,
    );
  return scaled;
};

/** Defaults apply only when choosing a category, preserving saved and manually edited bill periods. */
export const defaultAdjustmentPeriod = (category, sheet) => {
  if (
    !sheet?.settlementDate ||
    !["COUNCIL_RATES", "WATER_RATES"].includes(category)
  )
    return {};
  dateDay(sheet.settlementDate);
  const year = Number(sheet.settlementDate.slice(0, 4));
  const month = Number(sheet.settlementDate.slice(5, 7));
  let start;
  let end;
  if (category === "WATER_RATES") {
    const first = Math.floor((month - 1) / 3) * 3;
    start = new Date(Date.UTC(year, first, 1));
    end = new Date(Date.UTC(year, first + 3, 0));
  } else {
    const startMonth = Number(sheet.financialYearStartMonth || 7);
    const startDay = Number(sheet.financialYearStartDay || 1);
    const boundary = (y) =>
      new Date(
        Date.UTC(
          y,
          startMonth - 1,
          Math.min(startDay, new Date(Date.UTC(y, startMonth, 0)).getUTCDate()),
        ),
      );
    start = boundary(year);
    if (start.toISOString().slice(0, 10) > sheet.settlementDate)
      start = boundary(year - 1);
    end = boundary(start.getUTCFullYear() + 1);
    end.setUTCDate(end.getUTCDate() - 1);
  }
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
};

/** Changes category semantics without replacing unrelated row values or editing bill dates on sheet-date changes. */
export const changeAdjustment = (row, name, value, sheet) => ({
  ...row,
  [name]: value,
  ...(name === "category"
    ? {
        mode: adjustmentRow(value).mode,
        ...defaultAdjustmentPeriod(value, sheet),
        ...(value === "PENALTY_INTEREST" ? { startDate: sheet?.matterSettlementDate || "", endDate: sheet?.settlementDate || "" } : {}),
      }
    : name === "mode" && value === "INTEREST"
      ? { startDate: sheet?.matterSettlementDate || "", endDate: sheet?.settlementDate || "" } : {}),
});

/** Produces live totals and per-row validation without trusting floating-point money arithmetic. */
export const calculateSettlement = (sheet) => {
  const errors = [];
  let price = 0n;
  let deposit = 0n;
  let date;
  try {
    price = money(sheet.purchasePrice, "Purchase price");
  } catch (e) {
    errors.push(e.message);
  }
  try {
    deposit = money(sheet.deposit, "Deposit");
  } catch (e) {
    errors.push(e.message);
  }
  if (deposit > price) errors.push("Deposit cannot exceed the purchase price.");
  try {
    date = dateDay(sheet.settlementDate);
  } catch (e) {
    errors.push(e.message);
  }
  if (!["VENDOR", "PURCHASER"].includes(sheet.settlementDayOwner))
    errors.push("Choose who owns the settlement day.");
  let gstRate;
  try {
    if (sheet.gstRate !== null && sheet.gstRate !== undefined && sheet.gstRate !== "") {
      gstRate = money(sheet.gstRate, "GST rate");
      if (gstRate > 10000n) throw new Error("GST rate must be between 0 and 100%.");
    }
  } catch (e) { errors.push(e.message); }
  const gst = (base) => {
    if (gstRate === undefined) throw new Error("Enter a worksheet GST rate before selecting GST.");
    return divide(base * gstRate, 10000n);
  };
  let purchasePriceGst = 0n;
  if (sheet.purchasePriceGstApplicable) {
    try { purchasePriceGst = gst(price); } catch (e) { errors.push(e.message); }
  }
  let additions = 0n;
  let deductions = 0n;
  const rows = sheet.adjustments.map((row, index) => {
    if (!row.enabled) return { amount: "0.00" };
    try {
      const label =
        row.description ||
        CATEGORIES[row.category] ||
        `Adjustment ${index + 1}`;
      const amount = money(row.amount, label);
      if (
        !CATEGORIES[row.category] ||
        !["FIXED", "PRORATA", "INTEREST"].includes(row.mode) ||
        !["PAID", "UNPAID"].includes(row.paymentStatus)
      )
        throw new Error(
          "Choose a category, calculation and Paid/Unpaid status.",
        );
      if (
        ["OTHER", "UNIT_ENTITLEMENT"].includes(row.category) &&
        !row.description?.trim()
      )
        throw new Error("Enter a description for the other adjustment.");
      const unit = row.category === "UNIT_ENTITLEMENT";
      const water = row.category === "WATER_USAGE";
      if ((unit && row.mode !== "PRORATA") || (water && row.mode !== "FIXED"))
        throw new Error("Use the category's calculation method.");
      let result = amount;
      let usageDays = 0;
      const warnings = [];
      if (water) {
        const usage = quantity(row.averageDailyUsage, "Average daily usage");
        const reading = dateDay(row.lastMeterReadingDate);
        if (
          sheet.matterSettlementDate &&
          reading > dateDay(sheet.matterSettlementDate)
        )
          throw new Error(
            "Meter reading cannot be later than Settlement Date.",
          );
        if (sheet.matterAdjustmentDate && reading > dateDay(sheet.matterAdjustmentDate))
          throw new Error("Meter reading cannot be later than Adjustment Date.");
        if (date === undefined)
          throw new Error(
            "Select a calculation date before calculating water usage.",
          );
        usageDays = date - reading;
        if (usageDays < 0)
          throw new Error(
            "Meter reading is later than the calculation date; review the dates before calculating usage.",
          );
        result = divide(amount * usage * BigInt(usageDays), 1000000n);
      }
      let normalYearInterestDays = 0;
      let leapYearInterestDays = 0;
      let periodDays = 0;
      let purchaserDays = 0;
      let vendorDays = 0;
      if (row.mode !== "FIXED") {
        const start = dateDay(row.mode === "INTEREST" ? row.startDate || sheet.matterSettlementDate : row.startDate);
        const end = dateDay(
          row.mode === "INTEREST" ? sheet.settlementDate : row.endDate,
        );
        periodDays = end - start + 1;
        if (periodDays <= 0 || periodDays > 36600)
          throw new Error(
            "Enter an ordered date period of no more than 36,600 days.",
          );
        if (row.mode === "PRORATA") {
          if (date === undefined)
            throw new Error(
              "Enter the settlement date before calculating proration.",
            );
          if (date < start || date > end)
            warnings.push(
              "Calculation date is outside the billed period. Review the dates and amount; the calculated share may be negative or exceed the full bill.",
            );
          const buyerStart =
            date - start + (sheet.settlementDayOwner === "VENDOR" ? 1 : 0);
          purchaserDays =
            periodDays - buyerStart;
          vendorDays = periodDays - purchaserDays;
          const numerator = unit
            ? quantity(row.unitEntitlement, "Unit entitlement")
            : 1n;
          const denominator = unit
            ? quantity(row.totalEntitlements, "Total entitlements", true)
            : 1n;
          if (numerator > denominator)
            throw new Error(
              "Unit entitlement cannot exceed total entitlements.",
            );
          result = divide(
            amount *
              numerator *
              BigInt(row.paymentStatus === "PAID" ? purchaserDays : vendorDays),
            denominator * BigInt(periodDays),
          );
        } else {
          const rate = String(row.annualRate ?? "");
          if (!/^\d{1,4}(\.\d{0,6})?$/.test(rate) || Number(rate) > 1000)
            throw new Error(
              "Enter an annual rate from 0 to 1,000% with up to six decimal places.",
            );
          const [whole, fraction = ""] = rate.split(".");
          const scaledRate =
            BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, "0"));
          for (let cursor = start; cursor <= end;) {
            const year = new Date(cursor * DAY).getUTCFullYear();
            const nextYear = Date.UTC(year + 1, 0, 1) / DAY;
            const days = Math.min(end + 1, nextYear) - cursor;
            if (nextYear - Date.UTC(year, 0, 1) / DAY === 366) leapYearInterestDays += days;
            else normalYearInterestDays += days;
            cursor += days;
          }
          result = divide(
            amount * scaledRate * BigInt(normalYearInterestDays * 366 + leapYearInterestDays * 365),
            100n * 1000000n * 365n * 366n,
          );
        }
      }
      if (result > MAX_CENTS || result < -MAX_CENTS)
        throw new Error("Calculated amount is too large.");
      const gstAmount = row.gstApplicable ? gst(result) : 0n;
      if (row.paymentStatus === "PAID") additions += result + gstAmount;
      else deductions += result + gstAmount;
      return {
        amount: decimal(result),
        gstAmount: decimal(gstAmount),
        periodDays,
        normalYearInterestDays,
        leapYearInterestDays,
        purchaserDays,
        vendorDays,
        usageDays,
        warnings,
      };
    } catch (e) {
      const message = `Adjustment ${index + 1}: ${e.message}`;
      errors.push(message);
      return { amount: "0.00", error: message };
    }
  });
  let allocated = 0n;
  sheet.payees.forEach((payee, index) => {
    try {
      if (!payee.name?.trim()) throw new Error("enter a payee name.");
      allocated += money(payee.amount, "Payment amount");
    } catch (e) {
      errors.push(`Payment ${index + 1}: ${e.message}`);
    }
  });
  const balance = price - deposit;
  const purchaserTotal = balance + purchasePriceGst + additions;
  const due = purchaserTotal - deductions;
  if (due > MAX_CENTS || due < -MAX_CENTS)
    errors.push("Final balance exceeds the supported amount.");
  return {
    rows,
    errors,
    purchasePrice: decimal(price),
    purchasePriceGst: decimal(purchasePriceGst),
    purchaserTotal: decimal(purchaserTotal),
    vendorTotal: decimal(deductions),
    deposit: decimal(deposit),
    balancePurchasePrice: decimal(balance),
    additions: decimal(additions),
    deductions: decimal(deductions),
    finalBalance: decimal(due),
    allocated: decimal(allocated),
    unallocated: decimal(due - allocated),
    reconciled: due === allocated,
  };
};

/** Keeps only editable inputs and the concurrency token; server-derived fields never drive saves. */
export const settlementInput = (sheet) => ({
  version: sheet.version ?? null,
  settlementDate: sheet.settlementDate || null,
  calculationDateSource: sheet.calculationDateSource || null,
  settlementDayOwner: sheet.settlementDayOwner,
  purchasePrice: String(sheet.purchasePrice ?? ""),
  deposit: String(sheet.deposit ?? ""),
  notes: sheet.notes || "",
  gstRate: sheet.gstRate === "" || sheet.gstRate == null ? null : String(sheet.gstRate),
  purchasePriceGstApplicable: Boolean(sheet.purchasePriceGstApplicable),
  adjustments: sheet.adjustments.map((row) => ({
    enabled: row.enabled,
    category: row.category,
    description: row.description || "",
    mode: row.mode,
    paymentStatus: row.paymentStatus,
    gstApplicable: Boolean(row.gstApplicable),
    amount: row.amount === "" ? null : String(row.amount ?? "0"),
    startDate: row.startDate || (row.mode === "INTEREST" ? sheet.matterSettlementDate : null) || null,
    endDate:
      row.mode === "INTEREST"
        ? sheet.settlementDate || null
        : row.endDate || null,
    unitEntitlement:
      row.unitEntitlement === ""
        ? null
        : String(row.unitEntitlement ?? "") || null,
    totalEntitlements:
      row.totalEntitlements === ""
        ? null
        : String(row.totalEntitlements ?? "") || null,
    averageDailyUsage:
      row.averageDailyUsage === ""
        ? null
        : String(row.averageDailyUsage ?? "") || null,
    lastMeterReadingDate: row.lastMeterReadingDate || null,
    annualRate: row.annualRate === "" ? null : String(row.annualRate ?? "0"),
  })),
  payees: sheet.payees.map((row) => ({
    name: row.name,
    reference: row.reference || "",
    amount: String(row.amount ?? ""),
  })),
});

export const formatSettlementMoney = (value) => {
  const [whole, fraction = "00"] = String(value ?? "0.00").split(".");
  return `${whole.startsWith("-") ? "-" : ""}$${whole.replace("-", "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${fraction.padEnd(2, "0")}`;
};

export const adjustmentRow = (category = "OTHER", enabled = true) => ({
  enabled,
  category,
  description: "",
  mode: [
    "COUNCIL_RATES",
    "WATER_RATES",
    "STRATA_LEVIES",
    "LAND_TAX",
    "UNIT_ENTITLEMENT",
  ].includes(category)
    ? "PRORATA"
    : category === "PENALTY_INTEREST"
      ? "INTEREST"
      : "FIXED",
  paymentStatus: "PAID",
  gstApplicable: false,
  amount: "0",
  startDate: "",
  endDate: "",
  unitEntitlement: "",
  totalEntitlements: "",
  averageDailyUsage: "",
  lastMeterReadingDate: "",
  annualRate: "0",
});

/** Uses only saved/user-added rows; new worksheets start with an empty adjustment list. */
export const initialiseSettlement = (sheet) => ({
  ...sheet,
  gstRate: sheet.gstRate == null ? "" : String(sheet.gstRate),
  purchasePriceGstApplicable: Boolean(sheet.purchasePriceGstApplicable),
  purchasePrice: String(sheet.purchasePrice ?? "0"),
  deposit: String(sheet.deposit ?? "0"),
  adjustments: (sheet.adjustments || []).map((row) => ({
    ...row,
    startDate: row.startDate || (row.mode === "INTEREST" ? sheet.matterSettlementDate : ""),
    amount: row.amount == null ? "" : String(row.amount),
    annualRate: row.annualRate == null ? "" : String(row.annualRate),
  })),
  payees: (sheet.payees || []).map((row) => ({
    ...row,
    amount: String(row.amount ?? "0"),
  })),
});

/** Category names label normal items; custom adjustments use the user's required description. */
export const adjustmentTitle = (row) =>
  row.category === "OTHER"
    ? row.description?.trim() || CATEGORIES.OTHER
    : CATEGORIES[row.category] || "Adjustment";

/** Describes the currently implemented allocation without inventing day counts for fixed items. */
export const adjustmentExplanation = (row, result) => {
  const party =
    row.paymentStatus === "PAID" ? "Purchaser allows" : "Vendor allows";
  if (row.category === "WATER_USAGE")
    return `${party}: ${result.usageDays} days: ${formatSettlementMoney(result.amount)}`;
  if (row.mode === "PRORATA") {
    const days =
      row.paymentStatus === "PAID" ? result.purchaserDays : result.vendorDays;
    return `${row.category === "UNIT_ENTITLEMENT" ? `${row.unitEntitlement}/${row.totalEntitlements} entitlement · ` : ""}${party} ${days}/${result.periodDays} days: ${formatSettlementMoney(result.amount)}`;
  }
  if (row.mode === "INTEREST")
    return `${party}: ${result.periodDays} days at ${row.annualRate}% p.a. (${result.normalYearInterestDays} days/365 + ${result.leapYearInterestDays} days/366): ${formatSettlementMoney(result.amount)}`;
  return `${party}: ${formatSettlementMoney(result.amount)}`;
};
