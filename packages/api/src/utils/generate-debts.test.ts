import Decimal from "decimal.js";
import { expect, test } from "vitest";

import {
  type DebtWithExpense,
  generateDebts,
  type IDebt,
} from "./generate-debts";

test("generateDebts should return correct debts with none settled", () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(26.31),
      settled: new Decimal(0),
      debtorId: "debtor1",
      expense: { payerId: "payer1" },
    },
    {
      amount: new Decimal(14.17),
      settled: new Decimal(0),
      debtorId: "debtor2",
      expense: { payerId: "payer2" },
    },
    {
      amount: new Decimal(14.18),
      settled: new Decimal(0),
      debtorId: "debtor3",
      expense: { payerId: "payer3" },
    },
  ];

  const expectedDebts: IDebt[] = [
    { fromId: "debtor1", toId: "payer1", amount: new Decimal(26.31) },
    { fromId: "debtor2", toId: "payer2", amount: new Decimal(14.17) },
    { fromId: "debtor3", toId: "payer3", amount: new Decimal(14.18) },
  ];

  const result = generateDebts(debts);
  expect(result).toEqual(expectedDebts);
});

test("generateDebts should return correct debts with some partially settled", () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(26.31),
      settled: new Decimal(0),
      debtorId: "debtor1",
      expense: { payerId: "payer1" },
    },
    {
      amount: new Decimal(14.17),
      settled: new Decimal(5),
      debtorId: "debtor2",
      expense: { payerId: "payer2" },
    },
    {
      amount: new Decimal(14.18),
      settled: new Decimal(2),
      debtorId: "debtor3",
      expense: { payerId: "payer3" },
    },
  ];

  const expectedDebts: IDebt[] = [
    { fromId: "debtor1", toId: "payer1", amount: new Decimal(26.31) },
    { fromId: "debtor2", toId: "payer2", amount: new Decimal(9.17) },
    { fromId: "debtor3", toId: "payer3", amount: new Decimal(12.18) },
  ];

  const result = generateDebts(debts);
  expect(result).toEqual(expectedDebts);
});

test("generateDebts should return correct debts with some partially settled and one fully settled", () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(26.31),
      settled: new Decimal(0),
      debtorId: "debtor1",
      expense: { payerId: "payer1" },
    },
    {
      amount: new Decimal(14.17),
      settled: new Decimal(5),
      debtorId: "debtor2",
      expense: { payerId: "payer2" },
    },
    {
      amount: new Decimal(14.18),
      settled: new Decimal(2),
      debtorId: "debtor3",
      expense: { payerId: "payer3" },
    },
    {
      amount: new Decimal(10),
      settled: new Decimal(10),
      debtorId: "debtor3",
      expense: { payerId: "payer3" },
    },
  ];

  const expectedDebts: IDebt[] = [
    { fromId: "debtor1", toId: "payer1", amount: new Decimal(26.31) },
    { fromId: "debtor2", toId: "payer2", amount: new Decimal(9.17) },
    { fromId: "debtor3", toId: "payer3", amount: new Decimal(12.18) },
  ];

  const result = generateDebts(debts);
  expect(result).toEqual(expectedDebts);
});

test("generateDebts should not create a debt if debtorId and payerId are the same", () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(26.31),
      settled: new Decimal(0),
      debtorId: "debtor1",
      expense: { payerId: "debtor1" },
    },
  ];

  const expectedDebts: IDebt[] = [];

  const result = generateDebts(debts);
  expect(result).toEqual(expectedDebts);
});

test("generateDebts should subtract settled amount from debt amount", () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(26.31),
      settled: new Decimal(10),
      debtorId: "debtor1",
      expense: { payerId: "payer1" },
    },
  ];

  const expectedDebts: IDebt[] = [
    { fromId: "debtor1", toId: "payer1", amount: new Decimal(16.31) },
  ];

  const result = generateDebts(debts);
  expect(result).toEqual(expectedDebts);
});
