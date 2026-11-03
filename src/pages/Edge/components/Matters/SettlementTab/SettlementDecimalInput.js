import React from "react";

/** Accepts editable decimal text without silently removing invalid characters or rounding inputs. */
export const settlementDecimalText = (value, decimalPlaces, maxValue) => {
  const text = value.trim();
  if (text === "") return "";
  const normalized = text.startsWith(".") ? `0${text}` : text;
  const pattern = new RegExp(`^\\d{1,12}(\\.\\d{0,${decimalPlaces}})?$`);
  if (!pattern.test(normalized)) return null;
  if (maxValue !== undefined && Number(normalized) > maxValue) return null;
  return normalized;
};

/** Restricts typing, paste and drop to non-negative decimals while retaining exact decimal strings. */
const SettlementDecimalInput = ({ value, onChange, decimalPlaces = 6, maxValue = 999999999999, ...props }) => (
  <input
    {...props}
    type="text"
    inputMode="decimal"
    autoComplete="off"
    spellCheck={false}
    pattern={`[0-9]+([.][0-9]{0,${decimalPlaces}})?`}
    value={value ?? ""}
    onChange={(event) => {
      const next = settlementDecimalText(event.target.value, decimalPlaces, maxValue);
      if (next !== null) onChange(next);
    }}
  />
);

export default SettlementDecimalInput;
