import type { OrderStatus } from "@/types/order";
import { EDITABLE_STATUSES, ORDER_TRANSITIONS } from "@/constants/orderStatus";
import { MAX_REDELIVERY } from "@/constants/business";

/** BR02 – is the status change allowed? */
export const canTransition = (from: OrderStatus, to: OrderStatus): boolean => ORDER_TRANSITIONS[from].includes(to);

/** BR07 – edit/cancel only before the order is assigned to a vehicle. */
export const canEdit = (status: OrderStatus): boolean => EDITABLE_STATUSES.includes(status);

/** BR06 – after a failed delivery: retry up to MAX_REDELIVERY times, then return to warehouse. */
export function statusAfterFailure(failedAttemptsBefore: number): { status: OrderStatus; failedAttempts: number } {
  const failedAttempts = failedAttemptsBefore + 1;
  return { status: failedAttempts > MAX_REDELIVERY ? "RETURNED" : "RETRY", failedAttempts };
}
