"use client";
import { useRef, useState } from "react";

interface Props {
  onScan: (barcode: string) => void;
  placeholder?: string;
}

/** USB barcode scanners type the code then press Enter; this input submits on Enter and refocuses. */
export function BarcodeInput({ onScan, placeholder = "Quét hoặc gõ mã vạch rồi nhấn Enter" }: Props) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  return (
    <input
      ref={ref}
      autoFocus
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={(e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        const code = value.trim().toUpperCase();
        if (code) onScan(code);
        setValue("");
        ref.current?.focus();
      }}
      placeholder={placeholder}
      className="w-full rounded-lg border-2 border-dashed border-[var(--brand)] bg-[var(--brand-light)]/40 px-3 py-2.5 font-mono text-sm outline-none"
    />
  );
}
