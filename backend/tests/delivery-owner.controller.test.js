import test from "node:test";
import assert from "node:assert/strict";
import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import { acceptDeliveryOrder, updateDeliveryLiveLocation } from "../controllers/delivery.controls.js";
import { updateOwnerOrderStatus } from "../controllers/owner.controls.js";
import { createMockRes } from "./_http-mocks.js";

test("updateDeliveryLiveLocation returns 400 when lat/lng missing", async () => {
  const req = {
    params: { orderId: "o1" },
    user: { _id: "d1" },
    body: {},
  };
  const res = createMockRes();

  await updateDeliveryLiveLocation(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /lat and lng are required/i);
});

test("acceptDeliveryOrder returns 404 when no ready order available", async () => {
  const originalFindOneAndUpdate = Order.findOneAndUpdate;
  Order.findOneAndUpdate = () => ({
    populate() {
      return this;
    },
    then(resolve) {
      return Promise.resolve(resolve(null));
    },
  });

  const req = { params: { orderId: "o1" }, user: { _id: "d1" } };
  const res = createMockRes();

  try {
    await acceptDeliveryOrder(req, res);
    assert.equal(res.statusCode, 404);
    assert.equal(res.body.success, false);
  } finally {
    Order.findOneAndUpdate = originalFindOneAndUpdate;
  }
});

test("updateOwnerOrderStatus returns 400 for invalid requested status", async () => {
  const req = {
    params: { orderId: "o1" },
    user: { _id: "owner1" },
    body: { status: "picked" },
  };
  const res = createMockRes();

  await updateOwnerOrderStatus(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /invalid status update for owner/i);
});

test("updateOwnerOrderStatus blocks invalid transition from pending to ready", async () => {
  const originalRestaurantFindOne = Restaurant.findOne;
  const originalOrderFindOne = Order.findOne;

  Restaurant.findOne = async () => ({ _id: "r1", owner: "owner1" });
  Order.findOne = () => ({
    populate() {
      return this;
    },
    then(resolve) {
      return Promise.resolve(
        resolve({
          _id: "o1",
          status: "pending",
        }),
      );
    },
  });

  const req = {
    params: { orderId: "o1" },
    user: { _id: "owner1" },
    body: { status: "ready" },
  };
  const res = createMockRes();

  try {
    await updateOwnerOrderStatus(req, res);
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid transition/i);
  } finally {
    Restaurant.findOne = originalRestaurantFindOne;
    Order.findOne = originalOrderFindOne;
  }
});

