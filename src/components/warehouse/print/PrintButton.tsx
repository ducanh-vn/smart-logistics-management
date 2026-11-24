"use client";

export function PrintButton() {
  return (
    <button onClick={() => window.print()} className="rounded-lg bg-[var(--brand)] px-4 py-2 text-sm font-medium text-white print:hidden">
      In phiếu / Lưu PDF
    </button>
  );
}
