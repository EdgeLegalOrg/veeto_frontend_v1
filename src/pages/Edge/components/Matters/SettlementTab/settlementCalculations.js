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
const divide = (numerator, denominator) =>
  (numerator + denominator / 2n) / denominator;
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
        !["ADD", "DEDUCT"].includes(row.direction)
      )
        throw new Error("Choose a category, calculation and direction.");
      if (row.category === "OTHER" && !row.description?.trim())
        throw new Error("Enter a description for the other adjustment.");
      let result = amount;
      let periodDays = 0;
      let purchaserDays = 0;
      let vendorDays = 0;
      if (row.mode !== "FIXED") {
        const start = dateDay(row.startDate);
        const end = dateDay(row.endDate);
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
          const buyerStart =
            date - start + (sheet.settlementDayOwner === "VENDOR" ? 1 : 0);
          purchaserDays =
            periodDays - Math.min(periodDays, Math.max(0, buyerStart));
          vendorDays = periodDays - purchaserDays;
          result = divide(
            amount *
              BigInt(row.direction === "ADD" ? purchaserDays : vendorDays),
            BigInt(periodDays),
          );
        } else {
          const rate = String(row.annualRate ?? "");
          if (!/^\d{1,4}(\.\d{0,6})?$/.test(rate) || Number(rate) > 1000)
            throw new Error(
              "Enter an annual rate from 0 to 1,000% with up to six decimal places.",
            );
          if (![365, 366].includes(Number(row.yearDays)))
            throw new Error("Choose a 365 or 366 day annual basis.");
          const [whole, fraction = ""] = rate.split(".");
          const scaledRate =
            BigInt(whole) * 1000000n + BigInt(fraction.padEnd(6, "0"));
          result = divide(
            amount * scaledRate * BigInt(periodDays),
            100n * 1000000n * BigInt(row.yearDays),
          );
        }
      }
      if (result > MAX_CENTS)
        throw new Error("Calculated amount is too large.");
      if (row.direction === "ADD") additions += result;
      else deductions += result;
      return { amount: decimal(result), periodDays, purchaserDays, vendorDays };
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
  const due = balance + additions - deductions;
  if (due > MAX_CENTS || due < -MAX_CENTS)
    errors.push("Final balance exceeds the supported amount.");
  return {
    rows,
    errors,
    purchasePrice: decimal(price),
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
  settlementDayOwner: sheet.settlementDayOwner,
  purchasePrice: String(sheet.purchasePrice ?? ""),
  deposit: String(sheet.deposit ?? ""),
  notes: sheet.notes || "",
  adjustments: sheet.adjustments.map((row) => ({
    enabled: row.enabled,
    category: row.category,
    description: row.description || "",
    mode: row.mode,
    direction: row.direction,
    amount: row.amount === "" ? null : String(row.amount ?? "0"),
    startDate: row.startDate || null,
    endDate: row.endDate || null,
    annualRate: row.annualRate === "" ? null : String(row.annualRate ?? "0"),
    yearDays: Number(row.yearDays || 365),
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
  mode: ["COUNCIL_RATES", "WATER_RATES", "STRATA_LEVIES", "LAND_TAX"].includes(
    category,
  )
    ? "PRORATA"
    : category === "PENALTY_INTEREST"
      ? "INTEREST"
      : "FIXED",
  direction: ["WATER_USAGE", "MORTGAGE_DISCHARGE"].includes(category)
    ? "DEDUCT"
    : "ADD",
  amount: "0",
  startDate: "",
  endDate: "",
  annualRate: "0",
  yearDays: 365,
});

/** Adds optional starter rows only to a new sheet; reopening a saved empty sheet preserves it. */
export const initialiseSettlement = (sheet) => ({
  ...sheet,
  purchasePrice: String(sheet.purchasePrice ?? "0"),
  deposit: String(sheet.deposit ?? "0"),
  adjustments:
    sheet.version == null && !sheet.adjustments?.length
      ? Object.keys(CATEGORIES)
          .filter((key) => key !== "OTHER")
          .map((category) => adjustmentRow(category, false))
      : (sheet.adjustments || []).map((row) => ({
          ...row,
          amount: row.amount == null ? "" : String(row.amount),
          annualRate: row.annualRate == null ? "" : String(row.annualRate),
        })),
  payees: (sheet.payees || []).map((row) => ({
    ...row,
    amount: String(row.amount ?? "0"),
  })),
});
