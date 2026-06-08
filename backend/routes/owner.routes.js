import express from "express";
import {
  createRestaurant,
  createMenuItem,
  deleteMenuItem,
  getOwnerDashboardData,
  getOwnerRestaurantStatus,
  updateMenuItem,
  updateOwnerOrderStatus,
} from "../controllers/owner.controls.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/AuthValidation.js";

const ownerRouter = express.Router();

ownerRouter.use(isAuthenticated, authorizeRoles("RestaurantOwner"));

ownerRouter.get("/restaurant-status", getOwnerRestaurantStatus);
ownerRouter.post("/restaurant", createRestaurant);
ownerRouter.get("/dashboard", getOwnerDashboardData);
ownerRouter.post("/menu", createMenuItem);
ownerRouter.put("/menu/:menuId", updateMenuItem);
ownerRouter.delete("/menu/:menuId", deleteMenuItem);
ownerRouter.patch("/orders/:orderId/status", updateOwnerOrderStatus);

export default ownerRouter;
