"use client";

import clsx from "clsx";

type Props = {
  /** Remount key — change when switching documents/rows so defaults refresh. */
  inputKey: string;
  /** Stored value. `null` means empty (no zero shown). */
  value: number | null;
  onValueChange: (value: number | null) => void;
  placeholder?: string;
  min?: number;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

/**
 * Uncontrolled number field. Empty stays empty — never paints a sticky "0".
 * Commits `null` when cleared; commits a number while typing valid digits.
 */
export function ClearableNumberInput({
  inputKey,
  value,
  onValueChange,
  placeholder,
  min = 0,
  className,
  id,
  "aria-label": ariaLabel,
}: Props) {
  const defaultValue = value == null || value === 0 ? "" : String(value);

  return (
    <input
      key={inputKey}
      id={id}
      aria-label={ariaLabel}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      className={clsx("field", className)}
      placeholder={placeholder}
      defaultValue={defaultValue}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw !== "" && !/^\d*\.?\d*$/.test(raw)) {
          e.target.value = raw.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
          return;
        }
        if (raw === "" || raw === ".") {
          onValueChange(null);
          return;
        }
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) return;
        onValueChange(min !== undefined ? Math.max(min, parsed) : parsed);
      }}
      onBlur={(e) => {
        const raw = e.target.value.trim();
        if (raw === "" || raw === ".") {
          e.target.value = "";
          onValueChange(null);
          return;
        }
        const parsed = Number(raw);
        if (!Number.isFinite(parsed)) {
          e.target.value = "";
          onValueChange(null);
          return;
        }
        const next = min !== undefined ? Math.max(min, parsed) : parsed;
        e.target.value = String(next);
        onValueChange(next);
      }}
    />
  );
}
