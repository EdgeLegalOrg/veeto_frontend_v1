/** Calculates the submitted line amount using the backend's rounded six-minute unit price. */
export const hourlyServiceLineAmount = (hourlyRate, units) =>
  Math.round(Number(hourlyRate) * 10) * Number(units) / 100;

/** Normalises explicit rates only; saved line totals must not be mistaken for hourly rates. */
export const normalizeInvoiceServiceLine = (line) => {
  if (line.billingFrequency !== "HOURLY") return { ...line };
  const hourlyRate = line.hourlyRate == null || String(line.hourlyRate).trim() === ""
    ? null : Number(line.hourlyRate);
  const units = line.units == null || String(line.units).trim() === "" ? null : Number(line.units);
  const valid = Number.isFinite(hourlyRate) && hourlyRate > 0 && Number.isInteger(units) && units > 0;
  return { ...line, hourlyRate, units, amount: valid ? hourlyServiceLineAmount(hourlyRate, units) : line.amount };
};

/** Converts a new drawer/catalogue/template item whose Amount represents its hourly rate. */
export const newInvoiceServiceLine = (source) => {
  const { id, invoiceId, checksum, ...line } = source;
  if (line.billingFrequency === "HOURLY") {
    line.hourlyRate = line.hourlyRate ?? line.amount;
    line.amount = 0;
  } else {
    delete line.hourlyRate;
  }
  return normalizeInvoiceServiceLine(line);
};

/** Provides actionable validation before saving or previewing hourly invoice lines. */
export const invoiceServiceLineError = (lines = []) => {
  for (const [index, source] of (lines || []).entries()) {
    const line = normalizeInvoiceServiceLine(source);
    if (line.billingFrequency !== "HOURLY") continue;
    if (!Number.isFinite(line.hourlyRate) || line.hourlyRate <= 0)
      return `Enter a positive hourly rate for service line ${index + 1}.`;
    if (!Number.isInteger(line.units) || line.units <= 0)
      return `Enter a positive whole number of six-minute units for service line ${index + 1}.`;
  }
  return null;
};
