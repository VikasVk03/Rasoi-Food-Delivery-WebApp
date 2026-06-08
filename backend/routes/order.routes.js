import express from "express";
import {
  getMyOrders,
  getOrderTracking,
  placeOrder,
} from "../controllers/order.controls.js";
import { isAuthenticated, authorizeRoles } from "../middlewares/AuthValidation.js";

const orderRouter = express.Router();

orderRouter.post("/", isAuthenticated, authorizeRoles("User"), placeOrder);
orderRouter.get("/my", isAuthenticated, authorizeRoles("User"), getMyOrders);
orderRouter.get("/:orderId/tracking", isAuthenticated, getOrderTracking);

export default orderRouter;
