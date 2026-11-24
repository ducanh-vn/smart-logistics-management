import { describe, expect, it } from "vitest";
import { isDispatchable, maintenanceState, validateVehicle } from "./fleet";

const now = new Date(2026, 10, 23, 9, 0);
const inDays = (n: number) => new Date(2026, 10, 23 + n, 15, 0);

describe("fleet rules (FR14)", () => {
  it("classifies service dates", () => {
    expect(maintenanceState(inDays(0), now)).toBe("OVERDUE");
    expect(maintenanceState(inDays(-3), now)).toBe("OVERDUE");
    expect(maintenanceState(inDays(5), now)).toBe("DUE_SOON");
    expect(maintenanceState(inDays(7), now)).toBe("DUE_SOON");
    expect(maintenanceState(inDays(8), now)).toBe("OK");
  });

  it("vehicles due for service cannot be dispatched", () => {
    expect(isDispatchable("READY", inDays(0), now)).toBe(false);
    expect(isDispatchable("READY", inDays(5), now)).toBe(true);
    expect(isDispatchable("ON_TRIP", inDays(30), now)).toBe(false);
  });

  it("validates plate and capacity", () => {
    expect(validateVehicle({ plate: "29C-123.45", type: "Tải 1 tấn", capacityKg: 1000, capacityM3: 6, nextServiceAt: "2026-12-30" })).toEqual([]);
    expect(validateVehicle({ plate: "29C12345", type: "", capacityKg: 0, capacityM3: 6, nextServiceAt: "" })).toHaveLength(4);
  });
});
