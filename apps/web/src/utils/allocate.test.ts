import { describe, expect, it } from "bun:test";
import { Decimal } from "decimal.js";
import { allocate } from "./allocate";

describe("allocate", () => {
  it("should allocate amounts evenly between two debtors", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 1 },
    ];
    const amount = 10;
    const result = allocate(items, amount);
    expect(result).toEqual([
      { debtorId: "a", amount: 5 },
      { debtorId: "b", amount: 5 },
    ]);
  });

  it("should distribute remainder when allocation is not even", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 1 },
      { debtorId: "c", ratio: 1 },
    ];
    const amount = 10;
    const result = allocate(items, amount);
    expect(result).toEqual([
      { debtorId: "a", amount: 3.34 },
      { debtorId: "b", amount: 3.33 },
      { debtorId: "c", amount: 3.33 },
    ]);
  });

  it("should handle multiple remainders correctly", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 1 },
      { debtorId: "c", ratio: 1 },
    ];
    const amount = 10.01;
    const result = allocate(items, amount);
    const totalAllocated = result.reduce(
      (sum, i) => sum.add(new Decimal(i.amount)),
      new Decimal(0)
    );
    expect(result).toEqual([
      { debtorId: "a", amount: 3.34 },
      { debtorId: "b", amount: 3.34 },
      { debtorId: "c", amount: 3.33 },
    ]);
    expect(totalAllocated.equals(new Decimal(amount))).toBe(true);
  });

  it("should return zeros if total ratio is zero", () => {
    const items = [
      { debtorId: "a", ratio: 0 },
      { debtorId: "b", ratio: 0 },
    ];
    const amount = 10;
    const result = allocate(items, amount);
    expect(result).toEqual([
      { debtorId: "a", amount: 0 },
      { debtorId: "b", amount: 0 },
    ]);
  });

  it("should return an empty array for empty items", () => {
    const items: { debtorId: string; ratio: number }[] = [];
    const amount = 10;
    const result = allocate(items, amount);
    expect(result).toEqual([]);
  });

  it("should return zeros if amount is zero", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 1 },
    ];
    const amount = 0;
    const result = allocate(items, amount);
    expect(result).toEqual([
      { debtorId: "a", amount: 0 },
      { debtorId: "b", amount: 0 },
    ]);
  });

  it("should handle floating point ratios", () => {
    const items = [
      { debtorId: "a", ratio: 0.5 },
      { debtorId: "b", ratio: 0.5 },
    ];
    const amount = 10;
    const result = allocate(items, amount);
    expect(result).toEqual([
      { debtorId: "a", amount: 5 },
      { debtorId: "b", amount: 5 },
    ]);
  });

  it("should allocate uneven ratios correctly", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 3 },
    ];
    const amount = 10;
    const result = allocate(items, amount);
    expect(result).toEqual([
      { debtorId: "a", amount: 2.5 },
      { debtorId: "b", amount: 7.5 },
    ]);
  });

  it("should not allocate to debtors with zero ratio", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 0 },
      { debtorId: "c", ratio: 1 },
    ];
    const amount = 10;
    const result = allocate(items, amount);
    expect(result).toEqual([
      { debtorId: "a", amount: 5 },
      { debtorId: "b", amount: 0 },
      { debtorId: "c", amount: 5 },
    ]);
  });

  it("should distribute cents correctly for small amounts", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 1 },
      { debtorId: "c", ratio: 1 },
    ];
    const amount = 0.05;
    const result = allocate(items, amount);
    const totalAllocated = result.reduce(
      (sum, i) => sum.add(new Decimal(i.amount)),
      new Decimal(0)
    );
    expect(result).toEqual([
      { debtorId: "a", amount: 0.02 },
      { debtorId: "b", amount: 0.02 },
      { debtorId: "c", amount: 0.01 },
    ]);
    expect(totalAllocated.equals(new Decimal(amount))).toBe(true);
  });

  it("should preserve total amount after allocation", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 2 },
      { debtorId: "c", ratio: 3 },
      { debtorId: "d", ratio: 4 },
      { debtorId: "e", ratio: 5 },
    ];
    const amount = 123.45;
    const result = allocate(items, amount);
    const totalAllocated = result.reduce(
      (sum, i) => sum.add(new Decimal(i.amount)),
      new Decimal(0)
    );
    expect(totalAllocated.equals(new Decimal(amount))).toBe(true);
  });

  it("should not give remainder to items with zero ratio", () => {
    const items = [
      { debtorId: "a", ratio: 1 },
      { debtorId: "b", ratio: 1 },
      { debtorId: "c", ratio: 0 },
      { debtorId: "d", ratio: 1 },
    ];
    const amount = 10;
    const result = allocate(items, amount);

    const totalAllocated = result.reduce(
      (sum, i) => sum.add(new Decimal(i.amount)),
      new Decimal(0)
    );
    expect(totalAllocated.equals(new Decimal(amount))).toBe(true);

    expect(result).toEqual([
      { debtorId: "a", amount: 3.34 },
      { debtorId: "b", amount: 3.33 },
      { debtorId: "c", amount: 0 },
      { debtorId: "d", amount: 3.33 },
    ]);
  });
});
