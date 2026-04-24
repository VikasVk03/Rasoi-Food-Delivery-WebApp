import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import User from "../models/users.model.js";
import { buildEarningSeries, buildSalesSeries } from "../utils/insights.js";

export const getAdminDashboard = async (req, res) => {
  try {
    const [users, restaurants, deliveredOrders, liveOrders] = await Promise.all([
      User.find({}).select("fullName email role accountVerified createdAt").lean(),
      Restaurant.find({}).select("name cuisineType rating isOpen owner createdAt").lean(),
      Order.find({ status: "delivered" }).lean(),
      Order.find({ status: { $in: ["pending", "accepted", "preparing", "ready", "picked"] } })
        .populate("restaurantId", "name")
        .populate("userId", "fullName")
        .populate("deliveryBoyId", "fullName")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    const salesDaily = buildSalesSeries(deliveredOrders);
    const ownerRevenueDaily = buildEarningSeries(deliveredOrders, 0.75);
    const deliveryRevenueDaily = buildEarningSeries(deliveredOrders, 0.2);

    return res.status(200).json({
      success: true,
      overview: {
        totalUsers: users.length,
        totalRestaurants: restaurants.length,
        totalOrdersDelivered: deliveredOrders.length,
        grossSales: Number(
          deliveredOrders.reduce((sum, order) => sum + Number(order.totalPrice || 0), 0).toFixed(2),
        ),
      },
      users,
      restaurants,
      liveOrders,
      insights: {
        salesDaily,
        ownerRevenueDaily,
        deliveryRevenueDaily,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin dashboard.",
      error: error.message,
    });
  }
};
