import test from "node:test";
import assert from "node:assert/strict";
import Order from "../models/order.model.js";
import { getOrderTracking, placeOrder } from "../controllers/order.controls.js";
import { createMockRes } from "./_http-mocks.js";

test("placeOrder returns 400 when restaurantId/items missing", async () => {
  const req = {
    user: { _id: "u1" },
    body: { items: [] },
  };
  const res = createMockRes();

  await placeOrder(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /restaurantId and items are required/i);
});

test("getOrderTracking returns 404 when order not found", async () => {
  const originalFindById = Order.findById;
  Order.findById = () => ({
    populate() {
      return this;
    },
    lean: async () => null,
  });

  const req = { params: { orderId: "order-1" }, user: { _id: "u1", role: "User" } };
  const res = createMockRes();

  try {
    await getOrderTracking(req, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
  } finally {
    Order.findById = originalFindById;
  }
});

