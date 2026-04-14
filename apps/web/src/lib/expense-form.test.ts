import { describe, expect, it } from "vitest";

import { isExpenseSubmitDisabled } from "./expense-form";

const base = {
  title: "Zakupy",
  amount: 10.0,
  method: "ratio" as const,
  debtors: [
    { ratio: 1, custom: 0 },
    { ratio: 1, custom: 0 },
  ],
};

describe("isExpenseSubmitDisabled — common guards", () => {
  it("disabled when title is empty", () => {
    expect(isExpenseSubmitDisabled({ ...base, title: "" })).toBe(true);
  });

  it("disabled when title is whitespace only", () => {
    expect(isExpenseSubmitDisabled({ ...base, title: "   " })).toBe(true);
  });

  it("disabled when amount is zero", () => {
    expect(isExpenseSubmitDisabled({ ...base, amount: 0 })).toBe(true);
  });

  it("disabled when amount is negative", () => {
    expect(isExpenseSubmitDisabled({ ...base, amount: -5 })).toBe(true);
  });
});

describe("isExpenseSubmitDisabled — ratio mode", () => {
  it("enabled when at least one debtor has a positive ratio", () => {
    expect(isExpenseSubmitDisabled(base)).toBe(false);
  });

  it("disabled when all ratios are zero", () => {
    const v = {
      ...base,
      debtors: [
        { ratio: 0, custom: 0 },
        { ratio: 0, custom: 0 },
      ],
    };
    expect(isExpenseSubmitDisabled(v)).toBe(true);
  });

  it("enabled when only one debtor has ratio > 0", () => {
    const v = {
      ...base,
      debtors: [
        { ratio: 3, custom: 0 },
        { ratio: 0, custom: 0 },
      ],
    };
    expect(isExpenseSubmitDisabled(v)).toBe(false);
  });
});

describe("isExpenseSubmitDisabled — custom mode", () => {
  it("enabled when custom amounts exactly match total", () => {
    const v = {
      ...base,
      method: "custom" as const,
      debtors: [
        { ratio: 0, custom: 6.0 },
        { ratio: 0, custom: 4.0 },
      ],
    };
    expect(isExpenseSubmitDisabled(v)).toBe(false);
  });

  it("disabled when custom amounts do not sum to total", () => {
    const v = {
      ...base,
      method: "custom" as const,
      debtors: [
        { ratio: 0, custom: 5.0 },
        { ratio: 0, custom: 3.0 },
      ],
    };
    expect(isExpenseSubmitDisabled(v)).toBe(true);
  });

  it("disabled when all custom amounts are zero (even if total is also zero... but amount guard catches that)", () => {
    const v = {
      ...base,
      amount: 10.0,
      method: "custom" as const,
      debtors: [
        { ratio: 0, custom: 0 },
        { ratio: 0, custom: 0 },
      ],
    };
    expect(isExpenseSubmitDisabled(v)).toBe(true);
  });

  it("handles float precision — 3 equal shares of 10.00", () => {
    // 10 / 3 ≈ 3.33 + 3.33 + 3.34 = 10.00 in cents
    const v = {
      title: "Test",
      amount: 10.0,
      method: "custom" as const,
      debtors: [
        { ratio: 0, custom: 3.34 },
        { ratio: 0, custom: 3.33 },
        { ratio: 0, custom: 3.33 },
      ],
    };
    expect(isExpenseSubmitDisabled(v)).toBe(false);
  });

  it("handles 1.10 float — three equal shares", () => {
    // 1.10 / 3 = 0.37 + 0.37 + 0.36 = 1.10
    const v = {
      title: "Test",
      amount: 1.1,
      method: "custom" as const,
      debtors: [
        { ratio: 0, custom: 0.37 },
        { ratio: 0, custom: 0.37 },
        { ratio: 0, custom: 0.36 },
      ],
    };
    expect(isExpenseSubmitDisabled(v)).toBe(false);
  });
});
