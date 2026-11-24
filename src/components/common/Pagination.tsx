interface Props {
  page: number;
  size: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, size, total, onChange }: Props) {
  const pages = Math.max(1, Math.ceil(total / size));
  return (
    <div className="flex items-center justify-between gap-3 px-1 py-3 text-sm text-slate-600">
      <span>Tổng {total.toLocaleString("vi-VN")} bản ghi</span>
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="rounded border px-2 py-1 disabled:opacity-40">‹</button>
        <span>Trang {page}/{pages}</span>
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="rounded border px-2 py-1 disabled:opacity-40">›</button>
      </div>
    </div>
  );
}
