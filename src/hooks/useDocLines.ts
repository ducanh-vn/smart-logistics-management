"use client";
import { useState } from "react";

/** Editable line list for scan-based documents; scanning the same key again increases the quantity. */
export function useDocLines<T extends { barcode: string; quantity: number }>(keyOf: (l: T) => string = (l) => l.barcode) {
  const [lines, setLines] = useState<T[]>([]);

  const add = (line: T) =>
    setLines((ls) => {
      const i = ls.findIndex((l) => keyOf(l) === keyOf(line));
      if (i < 0) return [...ls, line];
      return ls.map((l, j) => (j === i ? { ...l, quantity: l.quantity + line.quantity } : l));
    });
  const update = (index: number, patch: Partial<T>) => setLines((ls) => ls.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  const remove = (index: number) => setLines((ls) => ls.filter((_, i) => i !== index));
  const clear = () => setLines([]);

  return { lines, add, update, remove, clear };
}
