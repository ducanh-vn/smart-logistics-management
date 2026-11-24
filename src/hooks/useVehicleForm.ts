"use client";
import { useEffect, useState } from "react";
import type { VehicleInput, VehicleRow } from "@/types/fleet";
import { VEHICLE_TYPE_OPTIONS } from "@/constants/fleet";
import { validateVehicle } from "@/lib/fleet";
import { useMutation } from "./useMutation";

const EMPTY: VehicleInput = { plate: "", type: "", capacityKg: 0, capacityM3: 0, nextServiceAt: "" };

/** Add / edit vehicle form state (FR13). */
export function useVehicleForm(vehicle: VehicleRow | null, onSaved: () => void) {
  const [form, setForm] = useState<VehicleInput>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const save = useMutation<VehicleInput>(vehicle ? `/api/fleet/vehicles/${vehicle.id}` : "/api/fleet/vehicles", vehicle ? "PATCH" : "POST");

  useEffect(() => {
    setErrors([]);
    setForm(vehicle ? { ...vehicle, nextServiceAt: vehicle.nextServiceAt.slice(0, 10) } : EMPTY);
  }, [vehicle]);

  const set = (key: keyof VehicleInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.value;
    setForm((f) => {
      if (key !== "type") return { ...f, [key]: key === "plate" ? value.toUpperCase() : value };
      const t = VEHICLE_TYPE_OPTIONS.find((o) => o.value === value);
      return { ...f, type: value, capacityKg: t?.capacityKg ?? f.capacityKg, capacityM3: t?.capacityM3 ?? f.capacityM3 };
    });
  };

  const submit = async () => {
    const errs = validateVehicle(form);
    setErrors(errs);
    if (errs.length) return;
    if (await save.run(form)) onSaved();
  };

  return { form, set, errors, submit, saving: save.loading, serverError: save.error };
}
