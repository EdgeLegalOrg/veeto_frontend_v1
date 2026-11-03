import React, { useLayoutEffect, useRef, useState } from "react";
import { settlementDecimalText } from "./SettlementDecimalInput";
import { formatSettlementMoney } from "./settlementCalculations";

/** Formats money when idle while keeping exact decimal text for calculation and API submission. */
const SettlementCurrencyInput = ({ value, onChange, ...props }) => {
  const [focused, setFocused] = useState(false);
  const input = useRef(null);
  // Select after React renders the unformatted value so the first edit replaces that value.
  useLayoutEffect(() => { if (focused) input.current?.select(); }, [focused]);
  const text = String(value ?? "");
  const valid = /^\d{1,12}(\.\d{0,2})?$/.test(text);
  return (
    <input
      {...props}
      ref={input}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      value={!focused && valid ? formatSettlementMoney(text) : text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onChange={(event) => {
        const next = event.target.value;
        // Accept a pasted dollar amount only if its grouping is valid; never turn 1,5 into 15.
        const trimmed = next.trim();
        const grouped = /^\$?\d{1,3}(,\d{3})+(\.\d{0,2})?$/.test(trimmed);
        const plain = /^\$?\d{1,12}(\.\d{0,2})?$/.test(trimmed);
        const candidate = grouped || plain ? trimmed.replace(/^\$/, "").replace(/,/g, "") : next;
        const decimal = settlementDecimalText(candidate, 2);
        if (decimal !== null) onChange(decimal);
      }}
    />
  );
};

export default SettlementCurrencyInput;
