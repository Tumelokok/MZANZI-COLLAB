import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseDealAmount, money, unpaidByCurrency, validDealDate, southAfricaToday, deadlineLabel } from '../src/lib/campaigns.ts';

test('decimal inputs preserve cents and respect each currency’s precision', () => {
  assert.equal(parseDealAmount('3000.00', 'ZAR'), 300000);
  assert.equal(parseDealAmount('0.10', 'USD'), 10);
  assert.equal(parseDealAmount('1.001', 'KWD'), 1001);
  assert.equal(parseDealAmount('120', 'JPY'), 120);
  for (const value of ['0', '-1', '1e3', 'NaN', '1,000', '0.001', '01.00', '1.', '', '10000000000.01']) assert.equal(parseDealAmount(value, 'ZAR'), null, value);
  assert.equal(parseDealAmount('120.1', 'JPY'), null);
  assert.equal(parseDealAmount('1.0001', 'KWD'), null);
  assert.equal(money(10, 'USD'), 'USD 0.10');
  assert.equal(money(1001, 'KWD'), 'KWD 1.001');
  assert.equal(money(120, 'JPY'), 'JPY 120');
});
test('unpaid totals separate currencies and never use floating point sums', () => {
  const totals = unpaidByCurrency([
    { currency: 'ZAR', outstanding_minor: 100 }, { currency: 'USD', outstanding_minor: 10 },
    { currency: 'USD', outstanding_minor: 20 }, { currency: 'ZAR', outstanding_minor: 200 },
    { currency: 'EUR', outstanding_minor: 0 },
  ]);
  assert.deepEqual(totals, [['USD', BigInt(30)], ['ZAR', BigInt(300)]]);
  assert.deepEqual(unpaidByCurrency([]), []);
});
test('deadlines use South African calendar days and reject invalid dates', () => {
  assert.equal(southAfricaToday(new Date('2026-11-22T22:01:00Z')), '2026-11-23');
  assert.equal(southAfricaToday(new Date('2026-11-22T21:59:00Z')), '2026-11-22');
  assert.equal(validDealDate('2028-02-29'), true);
  for (const date of ['2026-02-29', '2026-02-30', '23/11/2026', '1999-12-31', '2101-01-01']) assert.equal(validDealDate(date), false);
  assert.equal(deadlineLabel('2026-11-22', '2026-11-23'), 'Overdue');
  assert.equal(deadlineLabel('2026-11-23', '2026-11-23'), 'Due today');
  assert.equal(deadlineLabel('2026-11-24', '2026-11-23'), 'Upcoming');
});
