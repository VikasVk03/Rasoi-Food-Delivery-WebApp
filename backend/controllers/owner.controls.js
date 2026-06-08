import Menu from "../models/menu.model.js";
import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import { buildSalesSeries } from "../utils/insights.js";
import { getIO } from "../socket.js";

const getOwnerRestaurant = async (ownerId) => {
  return Restaurant.findOne({ owner: ownerId });
};

export const getOwnerRestaurantStatus = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    return res.status(200).json({
      success: true,
      hasRestaurant: Boolean(restaurant),
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch owner restaurant status.",
      error: error.message,
    });
  }
};

export const createRestaurant = async (req, res) => {
  try {
    const existingRestaurant = await getOwnerRestaurant(req.user._id);
    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant already exists for this owner.",
      });
    }

    const { name, cuisineType, image, isOpen, location } = req.body;

    const hasLat = location?.lat !== undefined && location?.lat !== null;
    const hasLng = location?.lng !== undefined && location?.lng !== null;

    if (!name || !cuisineType || !hasLat || !hasLng) {
      return res.status(400).json({
        success: false,
        message: "name, cuisineType and location(lat,lng) are required.",
      });
    }

    const restaurant = await Restaurant.create({
      name,
      cuisineType,
      image,
      isOpen: Boolean(isOpen),
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng),
      },
      owner: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully.",
      restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create restaurant.",
      error: error.message,
    });
  }
};

export const getOwnerDashboardData = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found for this owner.",
      });
    }

    const [menuItems, orders, deliveredOrders] = await Promise.all([
      Menu.find({ restaurantId: restaurant._id }).sort({ createdAt: -1 }).lean(),
      Order.find({ restaurantId: restaurant._id })
        .populate("userId", "fullName email mobile")
        .populate("items.itemId", "name price")
        .sort({ createdAt: -1 })
        .lean(),
      Order.find({ restaurantId: restaurant._id, status: "delivered" }).lean(),
    ]);

    const salesSeries = buildSalesSeries(deliveredOrders);
    const totalSales = salesSeries.reduce((sum, item) => sum + item.sales, 0);

    return res.status(200).json({
      success: true,
      restaurant,
      menuItems,
      orders,
      insights: {
        totalDeliveredOrders: deliveredOrders.length,
        totalSales: Number(totalSales.toFixed(2)),
        daily: salesSeries,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch owner dashboard data.",
      error: error.message,
    });
  }
};

export const createMenuItem = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found for this owner.",
      });
    }

    const menuItem = await Menu.create({
      ...req.body,
      restaurantId: restaurant._id,
    });

    return res.status(201).json({
      success: true,
      message: "Menu item created successfully.",
      menuItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create menu item.",
      error: error.message,
    });
  }
};

export const updateMenuItem = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found for this owner.",
      });
    }

    const menuItem = await Menu.findOneAndUpdate(
      { _id: req.params.menuId, restaurantId: restaurant._id },
      req.body,
      { new: true, runValidators: true },
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item updated successfully.",
      menuItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update menu item.",
      error: error.message,
    });
  }
};

export const deleteMenuItem = async (req, res) => {
  try {
    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found for this owner.",
      });
    }

    const deletedMenu = await Menu.findOneAndDelete({
      _id: req.params.menuId,
      restaurantId: restaurant._id,
    });

    if (!deletedMenu) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Menu item deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete menu item.",
      error: error.message,
    });
  }
};

export const updateOwnerOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = new Set(["accepted", "preparing", "ready", "rejected"]);

    if (!allowedStatuses.has(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status update for owner.",
      });
    }

    const restaurant = await getOwnerRestaurant(req.user._id);
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant found for this owner.",
      });
    }

    const order = await Order.findOne({
      _id: req.params.orderId,
      restaurantId: restaurant._id,
    })
      .populate("userId", "fullName email mobile")
      .populate("items.itemId", "name price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found.",
      });
    }

    const allowedTransitions = {
      pending: new Set(["accepted", "rejected"]),
      accepted: new Set(["preparing", "rejected"]),
      preparing: new Set(["ready", "rejected"]),
      ready: new Set([]),
      picked: new Set([]),
      delivered: new Set([]),
      rejected: new Set([]),
    };

    if (!allowedTransitions[order.status]?.has(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${order.status} to ${status}.`,
      });
    }

    order.status = status;
    await order.save();
    getIO()?.to(`order:${order._id}`).emit("order:tracking:update", {
      orderId: order._id,
      status: order.status,
      deliveryLocation: order.deliveryLocation,
      restaurantLocation: order.restaurantLocation,
      deliveryBoyLocation: order.deliveryBoyLocation,
      routePath: order.routePath,
    });

    return res.status(200).json({
      success: true,
      message: `Order ${status} successfully.`,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update order status.",
      error: error.message,
    });
  }
};
