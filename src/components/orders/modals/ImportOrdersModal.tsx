"use client";
import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";

interface Report {
  created: string[];
  errors: { row: number; messages: string[] }[];
}

export function ImportOrdersModal({ isOpen, onClose, onDone }: { isOpen: boolean; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const upload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    const res = await fetch("/api/orders/import", { method: "POST", body });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.message);
    setReport(data);
    onDone();
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { setReport(null); setFile(null); onClose(); }} title="Nhập đơn hàng từ Excel (UC04)">
      <p className="mb-3 text-sm text-slate-600">
        Dùng đúng file mẫu. Dòng hợp lệ được tạo đơn “Chờ duyệt”, dòng lỗi được liệt kê và không tạo đơn.{" "}
        <a href="/api/orders/import/template" className="text-[var(--brand)] underline">Tải file mẫu</a>
      </p>
      <input type="file" accept=".xlsx" onChange={(e) => { setFile(e.target.files?.[0] ?? null); setReport(null); }} className="mb-3 block w-full text-sm" />
      {error && <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {report && (
        <div className="mb-3 space-y-2 text-sm">
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">Đã tạo {report.created.length} đơn hàng.</p>
          {report.errors.length > 0 && (
            <div className="max-h-48 overflow-y-auto rounded-lg bg-rose-50 px-3 py-2 text-rose-800">
              <p className="font-medium">{report.errors.length} dòng lỗi:</p>
              <ul className="list-disc pl-5">
                {report.errors.map((e) => <li key={e.row}>Dòng {e.row}: {e.messages.join("; ")}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end">
        <Button onClick={upload} disabled={!file} loading={loading}>Tải lên</Button>
      </div>
    </Modal>
  );
}
