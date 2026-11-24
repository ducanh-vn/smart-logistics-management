import { describe, expect, it } from "vitest";
import { canEdit, canTransition, statusAfterFailure } from "./orderRules";

describe("order rules", () => {
  it("BR02: follows the main flow and blocks skipping steps", () => {
    expect(canTransition("PENDING", "APPROVED")).toBe(true);
    expect(canTransition("APPROVED", "ASSIGNED")).toBe(true);
    expect(canTransition("PENDING", "DELIVERED")).toBe(false);
  });
  it("BR07 / TC17: an assigned order cannot be edited or cancelled", () => {
    expect(canEdit("APPROVED")).toBe(true);
    expect(canEdit("ASSIGNED")).toBe(false);
    expect(canTransition("ASSIGNED", "CANCELLED")).toBe(false);
  });
  it("BR06: two redeliveries, then return to warehouse", () => {
    expect(statusAfterFailure(0).status).toBe("RETRY");
    expect(statusAfterFailure(1).status).toBe("RETRY");
    expect(statusAfterFailure(2).status).toBe("RETURNED");
  });
});
