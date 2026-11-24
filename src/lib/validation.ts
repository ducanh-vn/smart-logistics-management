import type { OrderInput, ValidationError } from "@/types/order";
import { vi } from "@/constants/i18n/vi";
import { findDistrict } from "@/constants/districts";

export const PHONE_REGEX = /^0\d{9}$/;

/** Validates a new order (UC03). Returns an empty list when the input is valid. */
export function validateOrderInput(input: Partial<OrderInput>): ValidationError[] {
  const errors: ValidationError[] = [];
  const required: (keyof OrderInput)[] = ["receiverName", "receiverPhone", "address", "district"];
  for (const f of required) {
    if (!String(input[f] ?? "").trim()) errors.push({ field: f, message: vi.errors.required });
  }
  if (input.receiverPhone && !PHONE_REGEX.test(input.receiverPhone.trim()))
    errors.push({ field: "receiverPhone", message: vi.errors.phone });
  if (input.district && !findDistrict(input.district))
    errors.push({ field: "district", message: "Khu vực giao không thuộc danh mục" });
  if (!(Number(input.weightKg) > 0)) errors.push({ field: "weightKg", message: vi.errors.positive });
  if (!input.customerId) errors.push({ field: "customerId", message: vi.errors.required });
  return errors;
}
