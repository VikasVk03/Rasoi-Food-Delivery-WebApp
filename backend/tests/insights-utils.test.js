import test from "node:test";
import assert from "node:assert/strict";
import { buildEarningSeries, buildSalesSeries, getDayKey } from "../utils/insights.js";

test("getDayKey returns YYYY-MM-DD", () => {
  const day = getDayKey("2026-04-25T12:30:00.000Z");
  assert.match(day, /^\d{4}-\d{2}-\d{2}$/);
});

test("buildSalesSeries aggregates order count and sales by day", () => {
  const orders = [
    { totalPrice: 100, deliveredAt: "2026-04-20T10:00:00.000Z" },
    { totalPrice: 250, deliveredAt: "2026-04-20T14:00:00.000Z" },
    { totalPrice: 80, deliveredAt: "2026-04-21T11:00:00.000Z" },
  ];

  const series = buildSalesSeries(orders);

  assert.equal(series.length, 2);
  assert.equal(series[0].orders, 2);
  assert.equal(series[0].sales, 350);
  assert.equal(series[1].orders, 1);
  assert.equal(series[1].sales, 80);
});

test("buildEarningSeries computes percentage-based earnings per day", () => {
  const orders = [
    { totalPrice: 100, deliveredAt: "2026-04-20T10:00:00.000Z" },
    { totalPrice: 50, deliveredAt: "2026-04-20T12:00:00.000Z" },
    { totalPrice: 80, deliveredAt: "2026-04-21T16:00:00.000Z" },
  ];

  const series = buildEarningSeries(orders, 0.2);

  assert.equal(series.length, 2);
  assert.equal(series[0].delivered, 2);
  assert.equal(series[0].earning, 30);
  assert.equal(series[1].delivered, 1);
  assert.equal(series[1].earning, 16);
});

