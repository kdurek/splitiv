import Decimal from 'decimal.js';
import { expect, test } from 'vitest';

import { type DebtWithExpense, generateBalances, type UserBalance } from './generateBalances';

test('simple generateBalances', () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(26.31),
      settled: new Decimal(0),
      debtorId: 'ttivc09jodsj566qo11wwbyz',
      expense: { amount: new Decimal(52.61), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(14.17),
      settled: new Decimal(0),
      debtorId: 'ttivc09jodsj566qo11wwbyz',
      expense: { amount: new Decimal(42.52), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(14.18),
      settled: new Decimal(0),
      debtorId: 'v719af4i38197yxwk6mutklx',
      expense: { amount: new Decimal(42.52), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(52),
      settled: new Decimal(4),
      debtorId: 'mwj4i43lw4gh4j34vslgo2bq',
      expense: { amount: new Decimal(52), payerId: 'v719af4i38197yxwk6mutklx' },
    },
  ];

  const expectedBalances: UserBalance[] = [
    { userId: 'ttivc09jodsj566qo11wwbyz', amount: '-40.48' },
    { userId: 'v719af4i38197yxwk6mutklx', amount: '60.13' },
    { userId: 'mwj4i43lw4gh4j34vslgo2bq', amount: '-19.65' },
  ];

  const result = generateBalances(debts);
  expect(result).toEqual(expectedBalances);
});

test('advanced generateBalances', () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(185.66),
      settled: new Decimal(0),
      debtorId: 'geya1lji1o2ol56zb27vy0bm',
      expense: { amount: new Decimal(959.23), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(216.6),
      settled: new Decimal(0),
      debtorId: 'clk5a4wfc002bmt5s8rxume8k',
      expense: { amount: new Decimal(959.23), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(247.54),
      settled: new Decimal(0),
      debtorId: 'mwj4i43lw4gh4j34vslgo2bq',
      expense: { amount: new Decimal(959.23), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(92.83),
      settled: new Decimal(0),
      debtorId: 'ttivc09jodsj566qo11wwbyz',
      expense: { amount: new Decimal(959.23), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(60.94),
      settled: new Decimal(0),
      debtorId: 'geya1lji1o2ol56zb27vy0bm',
      expense: { amount: new Decimal(243.77), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(60.94),
      settled: new Decimal(0),
      debtorId: 'clk5a4wfc002bmt5s8rxume8k',
      expense: { amount: new Decimal(243.77), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(60.94),
      settled: new Decimal(0),
      debtorId: 'ttivc09jodsj566qo11wwbyz',
      expense: { amount: new Decimal(243.77), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(60.95),
      settled: new Decimal(0),
      debtorId: 'cllgzwis00005jv5fml6l6470',
      expense: { amount: new Decimal(243.77), payerId: 'v719af4i38197yxwk6mutklx' },
    },
    {
      amount: new Decimal(12.75),
      settled: new Decimal(0),
      debtorId: 'clk5a4wfc002bmt5s8rxume8k',
      expense: { amount: new Decimal(126.26), payerId: 'geya1lji1o2ol56zb27vy0bm' },
    },
    {
      amount: new Decimal(30.67),
      settled: new Decimal(0),
      debtorId: 'mwj4i43lw4gh4j34vslgo2bq',
      expense: { amount: new Decimal(126.26), payerId: 'geya1lji1o2ol56zb27vy0bm' },
    },
    {
      amount: new Decimal(24.22),
      settled: new Decimal(0),
      debtorId: 'ttivc09jodsj566qo11wwbyz',
      expense: { amount: new Decimal(126.26), payerId: 'geya1lji1o2ol56zb27vy0bm' },
    },
    {
      amount: new Decimal(33.87),
      settled: new Decimal(0),
      debtorId: 'cllgzwis00005jv5fml6l6470',
      expense: { amount: new Decimal(126.26), payerId: 'geya1lji1o2ol56zb27vy0bm' },
    },
    {
      amount: new Decimal(12),
      settled: new Decimal(0),
      debtorId: 'geya1lji1o2ol56zb27vy0bm',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(25),
      settled: new Decimal(0),
      debtorId: 'clk5a4wfc002bmt5s8rxume8k',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(5.23),
      settled: new Decimal(0),
      debtorId: 'ttivc09jodsj566qo11wwbyz',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(71.03),
      settled: new Decimal(0),
      debtorId: 'cllgzwis00005jv5fml6l6470',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(74.06999999999999),
      settled: new Decimal(0),
      debtorId: 'geya1lji1o2ol56zb27vy0bm',
      expense: { amount: new Decimal(1111), payerId: 'ttivc09jodsj566qo11wwbyz' },
    },
    {
      amount: new Decimal(148.13),
      settled: new Decimal(0),
      debtorId: 'clk5a4wfc002bmt5s8rxume8k',
      expense: { amount: new Decimal(1111), payerId: 'ttivc09jodsj566qo11wwbyz' },
    },
    {
      amount: new Decimal(222.2),
      settled: new Decimal(0),
      debtorId: 'mwj4i43lw4gh4j34vslgo2bq',
      expense: { amount: new Decimal(1111), payerId: 'ttivc09jodsj566qo11wwbyz' },
    },
    {
      amount: new Decimal(370.33),
      settled: new Decimal(0),
      debtorId: 'v719af4i38197yxwk6mutklx',
      expense: { amount: new Decimal(1111), payerId: 'ttivc09jodsj566qo11wwbyz' },
    },
    {
      amount: new Decimal(222.52),
      settled: new Decimal(0),
      debtorId: 'v719af4i38197yxwk6mutklx',
      expense: { amount: new Decimal(222.52), payerId: 'geya1lji1o2ol56zb27vy0bm' },
    },
  ];

  const expectedBalances: UserBalance[] = [
    { userId: 'geya1lji1o2ol56zb27vy0bm', amount: '-8.64' },
    { userId: 'v719af4i38197yxwk6mutklx', amount: '393.55' },
    { userId: 'clk5a4wfc002bmt5s8rxume8k', amount: '-463.42' },
    { userId: 'mwj4i43lw4gh4j34vslgo2bq', amount: '-387.15' },
    { userId: 'ttivc09jodsj566qo11wwbyz', amount: '631.51' },
    { userId: 'cllgzwis00005jv5fml6l6470', amount: '-165.85' },
  ];

  const result = generateBalances(debts);
  expect(result).toEqual(expectedBalances);
});

test('partially paid generateBalances', () => {
  const debts: DebtWithExpense[] = [
    {
      amount: new Decimal(12),
      settled: new Decimal(0),
      debtorId: 'geya1lji1o2ol56zb27vy0bm',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(5.23),
      settled: new Decimal(0),
      debtorId: 'ttivc09jodsj566qo11wwbyz',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(25),
      settled: new Decimal(2),
      debtorId: 'clk5a4wfc002bmt5s8rxume8k',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(71.03),
      settled: new Decimal(26.76),
      debtorId: 'cllgzwis00005jv5fml6l6470',
      expense: { amount: new Decimal(125.23), payerId: 'mwj4i43lw4gh4j34vslgo2bq' },
    },
    {
      amount: new Decimal(370.33),
      settled: new Decimal(224.25),
      debtorId: 'v719af4i38197yxwk6mutklx',
      expense: { amount: new Decimal(1111), payerId: 'ttivc09jodsj566qo11wwbyz' },
    },
    {
      amount: new Decimal(74.06999999999999),
      settled: new Decimal(12.62),
      debtorId: 'geya1lji1o2ol56zb27vy0bm',
      expense: { amount: new Decimal(1111), payerId: 'ttivc09jodsj566qo11wwbyz' },
    },
    {
      amount: new Decimal(222.2),
      settled: new Decimal(221.6),
      debtorId: 'mwj4i43lw4gh4j34vslgo2bq',
      expense: { amount: new Decimal(1111), payerId: 'ttivc09jodsj566qo11wwbyz' },
    },
  ];

  const expectedBalances: UserBalance[] = [
    { userId: 'geya1lji1o2ol56zb27vy0bm', amount: '-73.45' },
    { userId: 'mwj4i43lw4gh4j34vslgo2bq', amount: '83.90' },
    { userId: 'ttivc09jodsj566qo11wwbyz', amount: '202.90' },
    { userId: 'clk5a4wfc002bmt5s8rxume8k', amount: '-23.00' },
    { userId: 'cllgzwis00005jv5fml6l6470', amount: '-44.27' },
    { userId: 'v719af4i38197yxwk6mutklx', amount: '-146.08' },
  ];

  const result = generateBalances(debts);
  expect(result).toEqual(expectedBalances);
});
