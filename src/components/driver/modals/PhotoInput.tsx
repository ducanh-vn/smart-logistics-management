"use client";

interface Props {
  photo: string | null;
  busy: boolean;
  onFile: (f: File | undefined) => void;
  label: string;
}

/** Opens the back camera on phones (capture="environment"); falls back to file picker on desktop. */
export function PhotoInput({ photo, busy, onFile, label }: Props) {
  return (
    <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-300 p-3 text-center text-sm">
      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="Ảnh đã chụp" className="mx-auto max-h-48 rounded-lg" />
      ) : (
        <span className="text-slate-600">{busy ? "Đang xử lý ảnh…" : `📷 ${label}`}</span>
      )}
      {photo && <span className="mt-1 block text-xs text-slate-500">Bấm để chụp lại</span>}
    </label>
  );
}
