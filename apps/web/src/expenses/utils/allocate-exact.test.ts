import { describe, expect, it } from "vitest";

import { allocateExact, type AllocatableDebt } from "./allocate-exact";

function debt(
  debtId: string,
  amount: string,
  settled: string,
  expenseCreatedAt: string,
): AllocatableDebt {
  return { debtId, amount, settled, expenseCreatedAt };
}

describe("allocateExact", () => {
  it("consumes a single debt fully, no partial", () => {
    const debts = [debt("d1", "50.00", "0.00", "2026-01-01")];
    const result = allocateExact(debts, 50);
    expect(result.selectedIds).toEqual(["d1"]);
    expect(result.partial).toBeNull();
  });

  it("oldest debt consumed first", () => {
    const debts = [
      debt("newer", "30.00", "0.00", "2026-02-01"),
      debt("older", "30.00", "0.00", "2026-01-01"),
    ];
    const result = allocateExact(debts, 30);
    expect(result.selectedIds).toEqual(["older"]);
    expect(result.partial).toBeNull();
  });

  it("spills into the next-oldest debt, marking it partial", () => {
    const debts = [
      debt("d2", "40.00", "0.00", "2026-02-01"),
      debt("d1", "30.00", "0.00", "2026-01-01"),
    ];
    const result = allocateExact(debts, 50);
    expect(result.selectedIds).toEqual(["d1", "d2"]);
    expect(result.partial).toEqual({ debtId: "d2", amount: "20.00" });
  });

  it("respects already-settled amounts when computing remaining", () => {
    const debts = [debt("d1", "50.00", "20.00", "2026-01-01")];
    const result = allocateExact(debts, 30);
    expect(result.selectedIds).toEqual(["d1"]);
    expect(result.partial).toBeNull();
  });

  it("same-day debts tie-break by debtId ascending", () => {
    const debts = [
      debt("b", "20.00", "0.00", "2026-01-01"),
      debt("a", "20.00", "0.00", "2026-01-01"),
    ];
    const result = allocateExact(debts, 20);
    expect(result.selectedIds).toEqual(["a"]);
  });

  it("target equal to total outstanding consumes everything, no partial", () => {
    const debts = [
      debt("d1", "10.00", "0.00", "2026-01-01"),
      debt("d2", "15.00", "0.00", "2026-01-02"),
    ];
    const result = allocateExact(debts, 25);
    expect(result.selectedIds).toEqual(["d1", "d2"]);
    expect(result.partial).toBeNull();
  });

  it("zero target selects nothing", () => {
    const debts = [debt("d1", "10.00", "0.00", "2026-01-01")];
    const result = allocateExact(debts, 0);
    expect(result.selectedIds).toEqual([]);
    expect(result.partial).toBeNull();
  });

  it("fully-settled debt (zero remaining) is skipped", () => {
    const debts = [
      debt("settled", "10.00", "10.00", "2026-01-01"),
      debt("open", "10.00", "0.00", "2026-01-02"),
    ];
    const result = allocateExact(debts, 10);
    expect(result.selectedIds).toEqual(["open"]);
  });

  it("partial amount is an exact 2-decimal string — no float drift", () => {
    const debts = [debt("d1", "0.30", "0.00", "2026-01-01")];
    const result = allocateExact(debts, 0.1);
    expect(result.partial).toEqual({ debtId: "d1", amount: "0.10" });
  });

  it("accepts Date instances for expenseCreatedAt, not just strings", () => {
    const debts = [
      {
        debtId: "newer",
        amount: "10.00",
        settled: "0.00",
        expenseCreatedAt: new Date("2026-02-01"),
      },
      {
        debtId: "older",
        amount: "10.00",
        settled: "0.00",
        expenseCreatedAt: new Date("2026-01-01"),
      },
    ];
    const result = allocateExact(debts, 10);
    expect(result.selectedIds).toEqual(["older"]);
  });
});
