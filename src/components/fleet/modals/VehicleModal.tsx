"use client";
import type { VehicleRow } from "@/types/fleet";
import { VEHICLE_TYPE_OPTIONS } from "@/constants/fleet";
import { useVehicleForm } from "@/hooks/useVehicleForm";
import { Modal } from "@/components/common/Modal";
import { FormField } from "@/components/common/FormField";
import { SelectField } from "@/components/common/SelectField";
import { Button } from "@/components/common/Button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  vehicle: VehicleRow | null;
  onSaved: () => void;
}

export function VehicleModal({ isOpen, onClose, vehicle, onSaved }: Props) {
  const { form, set, errors, submit, saving, serverError } = useVehicleForm(vehicle, onSaved);
  const problems = serverError ? [...errors, serverError] : errors;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={vehicle ? `Sửa xe ${vehicle.plate}` : "Thêm xe"}>
      <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="grid gap-3 sm:grid-cols-2" noValidate>
        <FormField label="Biển số" name="plate" placeholder="29C-123.45" value={form.plate} onChange={set("plate")} />
        <SelectField label="Loại xe" placeholder="– Chọn loại –" options={VEHICLE_TYPE_OPTIONS} value={form.type} onChange={set("type")} />
        <FormField label="Tải trọng (kg)" name="capacityKg" type="number" min="0" value={form.capacityKg} onChange={set("capacityKg")} />
        <FormField label="Thể tích (m³)" name="capacityM3" type="number" min="0" step="0.1" value={form.capacityM3} onChange={set("capacityM3")} />
        <FormField label="Bảo dưỡng kế tiếp" name="nextServiceAt" type="date" value={form.nextServiceAt} onChange={set("nextServiceAt")} />
        {problems.length > 0 && (
          <ul className="list-inside list-disc rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 sm:col-span-2">
            {problems.map((p) => <li key={p}>{p}</li>)}
          </ul>
        )}
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>Đóng</Button>
          <Button type="submit" loading={saving}>Lưu</Button>
        </div>
      </form>
    </Modal>
  );
}
