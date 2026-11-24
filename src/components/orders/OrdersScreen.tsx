"use client";
import { useState } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useMeta } from "@/hooks/useMeta";
import { useMutation } from "@/hooks/useMutation";
import { OrdersToolbar } from "./topbar/OrdersToolbar";
import { OrdersTable } from "./workspace/OrdersTable";
import { OrderDetailDrawer } from "./sidebar/OrderDetailDrawer";
import { CreateOrderModal } from "./modals/CreateOrderModal";
import { ImportOrdersModal } from "./modals/ImportOrdersModal";
import { Pagination } from "@/components/common/Pagination";

type ModalKind = "create" | "import" | null;
interface BulkResult { done: string[]; rejected: { code: string; reason: string }[] }

/** Orders module orchestrator: wires list state, modals, drawer and bulk actions. */
export function OrdersScreen({ canEdit }: { canEdit: boolean }) {
  const orders = useOrders();
  const { warehouses } = useMeta();
  const bulk = useMutation<{ ids: number[]; to: string }, BulkResult>("/api/orders/status");
  const [modal, setModal] = useState<ModalKind>(null);
  const [openId, setOpenId] = useState<number | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const runBulk = async (to: "APPROVED" | "CANCELLED") => {
    if (to === "CANCELLED" && !window.confirm(`Hủy ${orders.selected.length} đơn đã chọn?`)) return;
    const res = await bulk.run({ ids: orders.selected, to });
    if (!res) return;
    const verb = to === "APPROVED" ? "Đã duyệt" : "Đã hủy";
    const skipped = res.rejected.length ? `, bỏ qua ${res.rejected.length} đơn không hợp lệ (${res.rejected.slice(0, 3).map((r) => r.code).join(", ")}…)` : "";
    setNotice(`${verb} ${res.done.length} đơn${skipped}.`);
    orders.setSelected([]);
    orders.reload();
  };

  return (
    <>
      <OrdersToolbar
        filters={orders.filters}
        warehouses={warehouses}
        onChange={orders.update}
        canEdit={canEdit}
        selectedCount={orders.selected.length}
        onCreate={() => setModal("create")}
        onImport={() => setModal("import")}
        onApprove={() => runBulk("APPROVED")}
        onCancel={() => runBulk("CANCELLED")}
      />
      {(notice || bulk.error) && (
        <div className={`mb-3 rounded-lg px-3 py-2 text-sm ${bulk.error ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
          {bulk.error ?? notice}
        </div>
      )}
      <div className="rounded-xl border bg-white">
        {orders.loading && !orders.data ? (
          <p className="p-6 text-sm text-slate-500">Đang tải danh sách…</p>
        ) : (
          <OrdersTable
            items={orders.data?.items ?? []}
            selected={orders.selected}
            canEdit={canEdit}
            onToggle={orders.toggle}
            onToggleAll={orders.toggleAll}
            onOpen={setOpenId}
          />
        )}
      </div>
      {orders.data && (
        <Pagination page={orders.data.page} size={orders.data.size} total={orders.data.total} onChange={(page) => orders.update({ page })} />
      )}
      <OrderDetailDrawer orderId={openId} onClose={() => setOpenId(null)} />
      <CreateOrderModal
        isOpen={modal === "create"}
        onClose={() => setModal(null)}
        onCreated={(code) => { setModal(null); setNotice(`Đã tạo đơn ${code}.`); orders.reload(); }}
      />
      <ImportOrdersModal isOpen={modal === "import"} onClose={() => setModal(null)} onDone={orders.reload} />
    </>
  );
}
