import Order from "../models/order.model.js";
import { buildEarningSeries } from "../utils/insights.js";
import { buildDeliveryRoute } from "../utils/pathfinding.js";
import { getIO } from "../socket.js";

export const getDeliveryDashboardData = async (req, res) => {
  try {
    const [availableOrders, myDeliveries, deliveredOrders] = await Promise.all([
      Order.find({
        status: "ready",
        deliveryBoyId: null,
      })
        .populate("restaurantId", "name image cuisineType")
        .populate("userId", "fullName mobile")
        .sort({ createdAt: -1 })
        .lean(),
      Order.find({
        deliveryBoyId: req.user._id,
        status: { $in: ["picked", "delivered"] },
      })
        .populate("restaurantId", "name image cuisineType")
        .populate("userId", "fullName mobile")
        .sort({ createdAt: -1 })
        .lean(),
      Order.find({
        deliveryBoyId: req.user._id,
        status: "delivered",
      }).lean(),
    ]);

    const earningsSeries = buildEarningSeries(deliveredOrders, 0.2);
    const totalEarning = earningsSeries.reduce((sum, item) => sum + item.earning, 0);

    return res.status(200).json({
      success: true,
      availableOrders,
      myDeliveries,
      earningsInsights: {
        totalDeliveries: deliveredOrders.length,
        totalEarning: Number(totalEarning.toFixed(2)),
        daily: earningsSeries,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch delivery dashboard data.",
      error: error.message,
    });
  }
};

export const updateDeliveryLiveLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "lat and lng are required." });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      deliveryBoyId: req.user._id,
      status: "picked",
    });

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found for location update." });
    }

    const currentLocation = { lat: Number(lat), lng: Number(lng) };
    const route = buildDeliveryRoute({
      restaurantLocation: order.restaurantLocation,
      userLocation: order.deliveryLocation,
      deliveryBoyLocation: currentLocation,
    });

    order.deliveryBoyLocation = { ...currentLocation, updatedAt: new Date() };
    order.routePath = route.routePath;
    await order.save();
    getIO()?.to(`order:${order._id}`).emit("order:tracking:update", {
      orderId: order._id,
      status: order.status,
      deliveryBoyLocation: order.deliveryBoyLocation,
      routePath: order.routePath,
      deliveryLocation: order.deliveryLocation,
      restaurantLocation: order.restaurantLocation,
    });

    return res.status(200).json({
      success: true,
      message: "Live location updated.",
      routeDistanceKm: route.distanceKm,
      deliveryBoyLocation: order.deliveryBoyLocation,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update location.",
      error: error.message,
    });
  }
};

export const acceptDeliveryOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        status: "ready",
        deliveryBoyId: null,
      },
      { deliveryBoyId: req.user._id, status: "picked" },
      { new: true },
    )
      .populate("restaurantId", "name image cuisineType")
      .populate("userId", "fullName mobile");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not available for pickup.",
      });
    }
    getIO()?.to(`order:${order._id}`).emit("order:tracking:update", {
      orderId: order._id,
      status: order.status,
      deliveryBoyLocation: order.deliveryBoyLocation,
      deliveryLocation: order.deliveryLocation,
      restaurantLocation: order.restaurantLocation,
      routePath: order.routePath,
    });

    return res.status(200).json({
      success: true,
      message: "Order accepted for delivery.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to accept order.",
      error: error.message,
    });
  }
};

export const markOrderDelivered = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.orderId,
        deliveryBoyId: req.user._id,
        status: "picked",
      },
      { status: "delivered", deliveredAt: new Date() },
      { new: true },
    )
      .populate("restaurantId", "name image cuisineType")
      .populate("userId", "fullName mobile");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found for delivery completion.",
      });
    }
    getIO()?.to(`order:${order._id}`).emit("order:tracking:update", {
      orderId: order._id,
      status: order.status,
      deliveredAt: order.deliveredAt,
      deliveryBoyLocation: order.deliveryBoyLocation,
      routePath: order.routePath,
      deliveryLocation: order.deliveryLocation,
      restaurantLocation: order.restaurantLocation,
    });

    return res.status(200).json({
      success: true,
      message: "Order marked as delivered.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to mark order delivered.",
      error: error.message,
    });
  }
};
