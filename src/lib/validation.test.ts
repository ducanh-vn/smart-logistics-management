import { describe, expect, it } from "vitest";
import { validateOrderInput } from "./validation";

const valid = {
  customerId: 1, warehouseId: 1, receiverName: "Nguyễn Văn B", receiverPhone: "0912345123",
  address: "12 Trần Thái Tông", district: "Cầu Giấy", weightKg: 12, volumeM3: 0.07, expectedDate: "2026-07-21", items: [],
};

describe("validateOrderInput (UC03)", () => {
  it("TC01: accepts a valid order", () => {
    expect(validateOrderInput(valid)).toEqual([]);
  });
  it("TC02: rejects an empty receiver phone", () => {
    const errors = validateOrderInput({ ...valid, receiverPhone: "" });
    expect(errors.map((e) => e.field)).toContain("receiverPhone");
  });
  it("rejects a malformed phone and an unknown district", () => {
    const fields = validateOrderInput({ ...valid, receiverPhone: "12345", district: "Sao Hỏa" }).map((e) => e.field);
    expect(fields).toEqual(expect.arrayContaining(["receiverPhone", "district"]));
  });
});
