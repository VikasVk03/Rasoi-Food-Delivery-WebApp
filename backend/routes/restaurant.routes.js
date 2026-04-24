import express from "express";
import {
  getRecommendedFoodItems,
  getRecommendedRestaurants,
  getRestaurantMenu,
  getRestaurants,
} from "../controllers/restaurant.controls.js";

const restaurantRouter = express.Router();

restaurantRouter.get("/", getRestaurants);
restaurantRouter.get("/recommendations", getRecommendedRestaurants);
restaurantRouter.get("/recommendations/foods", getRecommendedFoodItems);
restaurantRouter.get("/:restaurantId/menu", getRestaurantMenu);

export default restaurantRouter;
