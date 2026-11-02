import React, { useState } from "react";
import { formatSettlementMoney } from "./settlementCalculations";

/** Formats money when idle while keeping exact decimal text for calculation and API submission. */
const SettlementCurrencyInput = ({ value, onChange, ...props }) => {
  const [focused, setFocused] = useState(false);
  const text = String(value ?? "");
  const valid = /^\d{1,12}(\.\d{0,2})?$/.test(text);
  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={!focused && valid ? formatSettlementMoney(text) : text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(event) => {
        const next = event.target.value;
        // Accept a pasted dollar amount only if its grouping is valid; never turn 1,5 into 15.
        const trimmed = next.trim();
        const grouped = /^\$?\d{1,3}(,\d{3})+(\.\d{0,2})?$/.test(trimmed);
        const plain = /^\$?\d{1,12}(\.\d{0,2})?$/.test(trimmed);
        onChange(grouped || plain ? trimmed.replace(/^\$/, "").replace(/,/g, "") : next);
      }}
    />
  );
};

export default SettlementCurrencyInput;
