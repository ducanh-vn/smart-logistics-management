"use client";
import { useEffect, useState } from "react";
import type { ValidationError } from "@/types/order";

export interface OrderForm {
  customerId: string;
  receiverName: string;
  receiverPhone: string;
  address: string;
  district: string;
  weightKg: string;
  expectedDate: string;
}

const EMPTY: OrderForm = { customerId: "", receiverName: "", receiverPhone: "", address: "", district: "", weightKg: "", expectedDate: "" };

/** Create-order form state, live fee quote (FR03) and submit with field errors (TC01, TC02). */
export function useCreateOrder(onCreated: (code: string) => void) {
  const [form, setForm] = useState<OrderForm>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [quote, setQuote] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const w = Number(form.weightKg);
    if (!form.district || !(w > 0)) return setQuote(null);
    const t = setTimeout(async () => {
      const res = await fetch("/api/orders/quote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ district: form.district, weightKg: w }) });
      setQuote(res.ok ? (await res.json()).fee : null);
    }, 250);
    return () => clearTimeout(t);
  }, [form.district, form.weightKg]);

  const set = (k: keyof OrderForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    const body = { ...form, customerId: Number(form.customerId), warehouseId: 0, weightKg: Number(form.weightKg), volumeM3: 0, items: [] };
    const res = await fetch("/api/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setErrors(Object.fromEntries(((data.errors ?? []) as ValidationError[]).map((e) => [e.field, e.message])));
      setMessage(data.message);
      return;
    }
    setForm(EMPTY);
    setErrors({});
    onCreated(data.code);
  };

  return { form, set, errors, quote, saving, message, submit };
}
