import test from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Order from "../models/order.model.js";

const createValidOrderPayload = () => ({
  userId: new mongoose.Types.ObjectId(),
  restaurantId: new mongoose.Types.ObjectId(),
  items: [{ itemId: new mongoose.Types.ObjectId(), quantity: 2 }],
  totalPrice: 299,
  deliveryLocation: { lat: 19.076, lng: 72.8777 },
  deliveryAddress: "Bandra West, Mumbai",
  restaurantLocation: { lat: 19.08, lng: 72.88 },
});

test("Order model sets default status to pending", () => {
  const order = new Order(createValidOrderPayload());
  assert.equal(order.status, "pending");
});

test("Order model allows all expected status values", () => {
  const allowed = ["pending", "accepted", "preparing", "ready", "picked", "delivered", "rejected"];
  for (const status of allowed) {
    const order = new Order({ ...createValidOrderPayload(), status });
    const error = order.validateSync();
    assert.equal(error, undefined, `Expected status "${status}" to be valid`);
  }
});

test("Order model rejects status outside enum", () => {
  const order = new Order({
    ...createValidOrderPayload(),
    status: "out_for_delivery",
  });
  const error = order.validateSync();
  assert.ok(error?.errors?.status);
  assert.match(error.errors.status.message, /`out_for_delivery` is not a valid enum value/i);
});

