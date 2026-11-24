import { describe, expect, it } from "vitest";
import { allocate, docCode, findShortages, isLowStock, stocktakeDiff } from "./stock";

describe("stock rules", () => {
  it("TC04 / BR03: rejects issuing 25 when only 20 in stock", () => {
    const res = findShortages([{ barcode: "MV001", quantity: 25 }], new Map([["MV001", 20]]));
    expect(res).toEqual([{ barcode: "MV001", requested: 25, available: 20 }]);
  });

  it("merges repeated scans before checking", () => {
    const lines = [{ barcode: "MV001", quantity: 12 }, { barcode: "MV001", quantity: 9 }];
    expect(findShortages(lines, new Map([["MV001", 20]]))).toHaveLength(1);
    expect(findShortages(lines.slice(0, 1), new Map([["MV001", 20]]))).toHaveLength(0);
  });

  it("TC24: 11 - 2 = 9 is below minimum 10", () => {
    expect(isLowStock(11, 10)).toBe(false);
    expect(isLowStock(9, 10)).toBe(true);
  });

  it("allocates across locations in order", () => {
    expect(allocate(7, [{ id: 1, quantity: 5 }, { id: 2, quantity: 10 }])).toEqual([{ id: 1, take: 5 }, { id: 2, take: 2 }]);
  });

  it("TC22: counted 48 vs 50 gives -2", () => {
    expect(stocktakeDiff(50, 48)).toBe(-2);
    expect(docCode("ISSUE", 12)).toBe("PX000012");
  });
});
