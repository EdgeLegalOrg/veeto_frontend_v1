/** Canonical direction for legacy stored values and parser responses; unknown stays neutral. */
export const normalizeEmailDirection = (direction) => {
  const value = String(direction || "").trim().toUpperCase();
  if (["SENT", "OUTGOING"].includes(value)) return "SENT";
  if (["RECEIVED", "INCOMING"].includes(value)) return "RECEIVED";
  return null;
};
