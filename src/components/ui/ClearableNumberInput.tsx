"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";

type Props = {
  value: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  min?: number;
  step?: string | number;
  className?: string;
  id?: string;
  "aria-label"?: string;
};

/** Number input that can be cleared (empty) instead of forcing a sticky 0. */
export function ClearableNumberInput({
  value,
  onValueChange,
  placeholder,
  min = 0,
  step = "any",
  className,
  id,
  "aria-label": ariaLabel,
}: Props) {
  const [text, setText] = useState(() => (value === 0 ? "" : String(value)));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(value === 0 ? "" : String(value));
    }
  }, [value, focused]);

  function commit(raw: string) {
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed === ".") {
      onValueChange(0);
      setText("");
      return;
    }
    const parsed = Number(trimmed);
    if (Number.isFinite(parsed)) {
      const next = min !== undefined ? Math.max(min, parsed) : parsed;
      onValueChange(next);
      setText(next === 0 ? "" : String(next));
    } else {
      setText(value === 0 ? "" : String(value));
    }
  }

  return (
    <input
      id={id}
      aria-label={ariaLabel}
      type="text"
      inputMode="decimal"
      className={clsx("field", className)}
      placeholder={placeholder}
      value={focused ? text : value === 0 ? "" : String(value)}
      onFocus={() => {
        setFocused(true);
        setText(value === 0 ? "" : String(value));
      }}
      onChange={(e) => {
        const next = e.target.value;
        if (next !== "" && !/^\d*\.?\d*$/.test(next)) return;
        setText(next);
        if (next === "" || next === ".") {
          onValueChange(0);
          return;
        }
        const parsed = Number(next);
        if (Number.isFinite(parsed)) onValueChange(parsed);
      }}
      onBlur={() => {
        setFocused(false);
        commit(text);
      }}
    />
  );
}
