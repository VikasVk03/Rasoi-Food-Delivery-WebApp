import test from "node:test";
import assert from "node:assert/strict";
import { buildDeliveryRoute } from "../utils/pathfinding.js";

test("buildDeliveryRoute returns non-empty routePath and distance", () => {
  const result = buildDeliveryRoute({
    restaurantLocation: { lat: 19.076, lng: 72.8777 },
    userLocation: { lat: 19.2183, lng: 72.9781 },
    deliveryBoyLocation: { lat: 19.13, lng: 72.9 },
  });

  assert.ok(Array.isArray(result.routePath));
  assert.ok(result.routePath.length > 0);
  assert.equal(typeof result.distanceKm, "number");
  assert.ok(result.distanceKm > 0);
});

test("buildDeliveryRoute uses restaurant as fallback when deliveryBoyLocation missing", () => {
  const result = buildDeliveryRoute({
    restaurantLocation: { lat: 19.076, lng: 72.8777 },
    userLocation: { lat: 19.2183, lng: 72.9781 },
  });

  assert.ok(result.routePath.length >= 10);
  assert.deepEqual(result.routePath[0], {
    lat: Number(19.076.toFixed(6)),
    lng: Number(72.8777.toFixed(6)),
  });
});

