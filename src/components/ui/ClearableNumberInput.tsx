"use client";

import { useState } from "react";
import clsx from "clsx";

type Props = {
  value: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

function formatValue(value: number): string {
  return value === 0 ? "" : String(value);
}

/** Number input that can be cleared (empty) instead of forcing a sticky 0. */
export function ClearableNumberInput({
  value,
  onValueChange,
  placeholder,
  min = 0,
  className,
  id,
  "aria-label": ariaLabel,
}: Props) {
  const [draft, setDraft] = useState<string | null>(null);
  const display = draft ?? formatValue(value);

  function parseAndCommit(raw: string) {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === ".") {
      onValueChange(0);
      return;
    }
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed)) {
      onValueChange(0);
      return;
    }
    onValueChange(min !== undefined ? Math.max(min, parsed) : parsed);
  }

  return (
    <input
      id={id}
      aria-label={ariaLabel}
      type="text"
      inputMode="decimal"
      className={clsx("field", className)}
      placeholder={placeholder}
      value={display}
      onFocus={() => setDraft(formatValue(value))}
      onChange={(e) => {
        const next = e.target.value;
        if (next !== "" && !/^\d*\.?\d*$/.test(next)) return;
        setDraft(next);
        if (next === "" || next === ".") {
          onValueChange(0);
          return;
        }
        const parsed = Number(next);
        if (Number.isFinite(parsed)) onValueChange(parsed);
      }}
      onBlur={() => {
        parseAndCommit(draft ?? formatValue(value));
        setDraft(null);
      }}
    />
  );
}
