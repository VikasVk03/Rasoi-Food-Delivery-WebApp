import express from "express";
import {
  acceptDeliveryOrder,
  getDeliveryDashboardData,
  markOrderDelivered,
  updateDeliveryLiveLocation,
} from "../controllers/delivery.controls.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/AuthValidation.js";

const deliveryRouter = express.Router();

deliveryRouter.use(isAuthenticated, authorizeRoles("DeliveryBoy"));

deliveryRouter.get("/dashboard", getDeliveryDashboardData);
deliveryRouter.patch("/orders/:orderId/accept", acceptDeliveryOrder);
deliveryRouter.patch("/orders/:orderId/delivered", markOrderDelivered);
deliveryRouter.patch("/orders/:orderId/live-location", updateDeliveryLiveLocation);

export default deliveryRouter;
