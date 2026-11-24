"use client";
import { Modal } from "@/components/common/Modal";
import { FormField } from "@/components/common/FormField";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/common/Button";
import { DISTRICTS } from "@/constants/districts";
import { ZONE_LABELS } from "@/constants/pricing";
import { useFetch } from "@/hooks/useFetch";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { formatVnd } from "@/lib/format";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (code: string) => void;
}

const DISTRICT_OPTIONS = DISTRICTS.map((d) => ({ value: d.name, label: `${d.name} (${ZONE_LABELS[d.zone]})` }));

export function CreateOrderModal({ isOpen, onClose, onCreated }: Props) {
  const { data: customers } = useFetch<{ id: number; code: string; name: string }[]>(isOpen ? "/api/customers" : null);
  const { form, set, errors, quote, saving, message, submit } = useCreateOrder(onCreated);
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tạo đơn hàng (UC03)" width="max-w-2xl">
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-3 sm:grid-cols-2" noValidate>
        <div className="sm:col-span-2">
          <SelectField label="Khách hàng gửi" placeholder="– Chọn khách hàng –" options={(customers ?? []).map((c) => ({ value: c.id, label: `${c.code} – ${c.name}` }))} value={form.customerId} onChange={set("customerId")} error={errors.customerId} />
        </div>
        <FormField label="Người nhận" name="receiverName" value={form.receiverName} onChange={set("receiverName")} error={errors.receiverName} />
        <FormField label="SĐT người nhận" name="receiverPhone" inputMode="tel" value={form.receiverPhone} onChange={set("receiverPhone")} error={errors.receiverPhone} />
        <div className="sm:col-span-2">
          <FormField label="Địa chỉ giao" name="address" value={form.address} onChange={set("address")} error={errors.address} />
        </div>
        <SelectField label="Khu vực" placeholder="– Chọn quận/huyện –" options={DISTRICT_OPTIONS} value={form.district} onChange={set("district")} error={errors.district} />
        <FormField label="Khối lượng (kg)" name="weightKg" type="number" min="0" step="0.1" value={form.weightKg} onChange={set("weightKg")} error={errors.weightKg} />
        <FormField label="Ngày giao mong muốn" name="expectedDate" type="date" value={form.expectedDate} onChange={set("expectedDate")} />
        <div className="flex items-end">
          <div className="w-full rounded-lg bg-[var(--brand-light)] px-3 py-2 text-sm">
            Cước tạm tính (BR01): <b>{quote !== null ? formatVnd(quote) : "–"}</b>
          </div>
        </div>
        {message && <p className="sm:col-span-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{message}</p>}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Đóng</Button>
          <Button type="submit" loading={saving}>Lưu đơn hàng</Button>
        </div>
      </form>
    </Modal>
  );
}
