import test from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import User from "../models/users.model.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/AuthValidation.js";
import { createMockRes, flushPromises } from "./_http-mocks.js";

test("isAuthenticated returns 401 when token missing", async () => {
  const req = { cookies: {} };
  const res = createMockRes();
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  isAuthenticated(req, res, next);
  await flushPromises();

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
});

test("isAuthenticated sets req.user and calls next for valid token", async () => {
  const originalVerify = jwt.verify;
  const originalFindById = User.findById;

  jwt.verify = () => ({ id: "user-123" });
  User.findById = async () => ({ _id: "user-123", role: "User" });

  const req = { cookies: { token: "valid-token" } };
  const res = createMockRes();
  let nextCalled = false;
  const next = () => {
    nextCalled = true;
  };

  try {
    isAuthenticated(req, res, next);
    await flushPromises();
    assert.equal(nextCalled, true);
    assert.deepEqual(req.user, { _id: "user-123", role: "User" });
  } finally {
    jwt.verify = originalVerify;
    User.findById = originalFindById;
  }
});

test("authorizeRoles returns 403 when role not allowed", () => {
  const middleware = authorizeRoles("Admin");
  const req = { user: { role: "User" } };
  const res = createMockRes();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
});

test("authorizeRoles calls next when role is allowed", () => {
  const middleware = authorizeRoles("User", "Admin");
  const req = { user: { role: "User" } };
  const res = createMockRes();
  let nextCalled = false;

  middleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(res.body, undefined);
});

