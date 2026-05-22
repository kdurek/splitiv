import { describe, expect, it } from "vitest";

import { canDeleteExpense, canSettleDebt, canUndoLog } from "./permissions";

const DEBTOR = "user-debtor";
const PAYER = "user-payer";
const ADMIN = "user-admin";
const OUTSIDER = "user-outsider";

describe("canSettleDebt", () => {
  it("allows the debtor to settle", () => {
    expect(canSettleDebt(DEBTOR, DEBTOR, PAYER, ADMIN)).toBe(true);
  });

  it("allows the payer to settle", () => {
    expect(canSettleDebt(PAYER, DEBTOR, PAYER, ADMIN)).toBe(true);
  });

  it("allows the group admin to settle", () => {
    expect(canSettleDebt(ADMIN, DEBTOR, PAYER, ADMIN)).toBe(true);
  });

  it("blocks an unrelated user", () => {
    expect(canSettleDebt(OUTSIDER, DEBTOR, PAYER, ADMIN)).toBe(false);
  });

  it("allows payer who is also admin", () => {
    expect(canSettleDebt(PAYER, DEBTOR, PAYER, PAYER)).toBe(true);
  });
});

describe("canUndoLog", () => {
  it("allows the debtor to undo", () => {
    expect(canUndoLog(DEBTOR, DEBTOR, PAYER, ADMIN)).toBe(true);
  });

  it("allows the payer to undo", () => {
    expect(canUndoLog(PAYER, DEBTOR, PAYER, ADMIN)).toBe(true);
  });

  it("allows the group admin to undo", () => {
    expect(canUndoLog(ADMIN, DEBTOR, PAYER, ADMIN)).toBe(true);
  });

  it("blocks an unrelated user", () => {
    expect(canUndoLog(OUTSIDER, DEBTOR, PAYER, ADMIN)).toBe(false);
  });
});

describe("canDeleteExpense", () => {
  it("allows the payer to delete", () => {
    expect(canDeleteExpense(PAYER, PAYER, ADMIN, false)).toBe(true);
  });

  it("allows the group admin to delete", () => {
    expect(canDeleteExpense(ADMIN, PAYER, ADMIN, false)).toBe(true);
  });

  it("allows a debtor to delete", () => {
    expect(canDeleteExpense(DEBTOR, PAYER, ADMIN, true)).toBe(true);
  });

  it("blocks an outsider who is not payer, admin, or debtor", () => {
    expect(canDeleteExpense(OUTSIDER, PAYER, ADMIN, false)).toBe(false);
  });

  it("blocks an outsider even when isDebtor is explicitly false", () => {
    expect(canDeleteExpense(OUTSIDER, PAYER, ADMIN, false)).toBe(false);
  });

  it("allows payer who is also the admin", () => {
    expect(canDeleteExpense(PAYER, PAYER, PAYER, false)).toBe(true);
  });
});
