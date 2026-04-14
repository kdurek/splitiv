import { describe, expect, it } from "vitest";

import { distributeByRatio } from "./distribute";

function debtors(ratios: number[]) {
  return ratios.map((ratio, i) => ({ userId: `user${i + 1}`, ratio }));
}

function amounts(result: { debtorId: string; amount: string }[]) {
  return result.map((r) => r.amount);
}

function sumCents(result: { debtorId: string; amount: string }[]) {
  return result.reduce((sum, r) => sum + Math.round(parseFloat(r.amount) * 100), 0);
}

describe("distributeByRatio", () => {
  it("equal split, clean division", () => {
    const result = distributeByRatio(10.0, debtors([1, 1]));
    expect(amounts(result)).toEqual(["5.00", "5.00"]);
  });

  it("equal split, indivisible — largest remainder assigns extra cent", () => {
    const result = distributeByRatio(10.0, debtors([1, 1, 1]));
    expect(amounts(result)).toEqual(["3.34", "3.33", "3.33"]);
  });

  it("unequal ratios 2:1", () => {
    const result = distributeByRatio(10.0, debtors([2, 1]));
    expect(amounts(result)).toEqual(["6.67", "3.33"]);
  });

  it("rounding classic — 0.10 ÷ 3", () => {
    const result = distributeByRatio(0.1, debtors([1, 1, 1]));
    expect(amounts(result)).toEqual(["0.04", "0.03", "0.03"]);
  });

  it("single debtor gets full amount", () => {
    const result = distributeByRatio(42.5, debtors([1]));
    expect(amounts(result)).toEqual(["42.50"]);
  });

  it("all ratios zero returns empty array", () => {
    expect(distributeByRatio(10.0, debtors([0, 0, 0]))).toEqual([]);
  });

  it("amount zero returns empty array", () => {
    expect(distributeByRatio(0, debtors([1, 1]))).toEqual([]);
  });

  it("output always has exactly 2 decimal places", () => {
    const result = distributeByRatio(7.0, debtors([3, 2, 1]));
    for (const { amount } of result) {
      expect(amount).toMatch(/^\d+\.\d{2}$/);
    }
  });

  it("sum invariant — output cents always equal input cents", () => {
    const cases: [number, number[]][] = [
      [10.0, [1, 1, 1]],
      [0.01, [1, 1]],
      [99.99, [3, 2, 1, 1]],
      [1.1, [1, 1, 1]],
      [0.1, [1, 1, 1]],
      [123.45, [10, 7, 3]],
    ];
    for (const [total, ratios] of cases) {
      const result = distributeByRatio(total, debtors(ratios));
      expect(sumCents(result)).toBe(Math.round(total * 100));
    }
  });

  it("single cent split — one person absorbs the indivisible cent", () => {
    const result = distributeByRatio(0.01, debtors([1, 1]));
    expect(amounts(result)).toEqual(["0.01", "0.00"]);
  });

  it("float precision input — 1.10 as JS float still sums correctly", () => {
    const result = distributeByRatio(1.1, debtors([1, 1, 1]));
    expect(sumCents(result)).toBe(110);
    for (const { amount } of result) {
      expect(amount).toMatch(/^\d+\.\d{2}$/);
    }
  });
});
