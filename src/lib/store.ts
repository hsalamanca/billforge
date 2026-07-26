"use client";

import { useSyncExternalStore } from "react";
import { canCreateDocument, getUsage, listDocuments } from "./storage";
import type { BillDocument, UsageState } from "./types";

const LISTENERS = new Set<() => void>();

export type StudioSnapshot = {
  docs: BillDocument[];
  usage: UsageState;
  gate: ReturnType<typeof canCreateDocument>;
  version: number;
};

let version = 0;
let cached: StudioSnapshot | null = null;

function buildSnapshot(): StudioSnapshot {
  return {
    docs: listDocuments(),
    usage: getUsage(),
    gate: canCreateDocument(),
    version,
  };
}

export function emitStudioChange() {
  version += 1;
  cached = buildSnapshot();
  LISTENERS.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  LISTENERS.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith("billforge.")) {
      emitStudioChange();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    LISTENERS.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const EMPTY: StudioSnapshot = {
  docs: [],
  usage: { monthKey: "", createdCount: 0, isPro: false },
  gate: { ok: true, remaining: 3, isPro: false },
  version: -1,
};

function getSnapshot(): StudioSnapshot {
  if (!cached) cached = buildSnapshot();
  return cached;
}

function getServerSnapshot(): StudioSnapshot {
  return EMPTY;
}

export function useStudioSnapshot(): StudioSnapshot {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
