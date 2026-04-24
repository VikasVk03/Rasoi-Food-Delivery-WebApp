import Menu from "../models/menu.model.js";
import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import { buildDeliveryRoute } from "../utils/pathfinding.js";

export const placeOrder = async (req, res) => {
  try {
    const { restaurantId, items, deliveryLocation, deliveryAddress } = req.body;

    if (!restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "restaurantId and items are required.",
      });
    }

    const restaurant = await Restaurant.findById(restaurantId).lean();
    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    const itemIds = items.map((item) => item.itemId);
    const menuItems = await Menu.find({
      _id: { $in: itemIds },
      restaurantId,
    }).lean();

    if (menuItems.length !== items.length) {
      return res.status(400).json({
        success: false,
        message: "Some items are invalid for this restaurant.",
      });
    }

    const menuMap = menuItems.reduce((acc, menuItem) => {
      acc[menuItem._id.toString()] = menuItem;
      return acc;
    }, {});

    const normalizedItems = [];
    let totalPrice = 0;

    for (const item of items) {
      const quantity = Number(item.quantity || 0);
      const menuItem = menuMap[item.itemId];

      if (!menuItem || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Invalid item quantity or item id.",
        });
      }

      totalPrice += menuItem.price * quantity;
      normalizedItems.push({
        itemId: menuItem._id,
        quantity,
      });
    }

    const location = deliveryLocation || { lat: 0, lng: 0 };
    const address = String(deliveryAddress || "").trim();
    if (!address) {
      return res.status(400).json({
        success: false,
        message: "deliveryAddress is required.",
      });
    }

    const customerLocation = {
      lat: Number(location.lat),
      lng: Number(location.lng),
    };

    const order = await Order.create({
      userId: req.user._id,
      restaurantId,
      items: normalizedItems,
      totalPrice,
      status: "pending",
      deliveryLocation: customerLocation,
      deliveryAddress: address,
      restaurantLocation: {
        lat: Number(restaurant.location?.lat || 0),
        lng: Number(restaurant.location?.lng || 0),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to place order.",
      error: error.message,
    });
  }
};

export const getOrderTracking = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("restaurantId", "name location")
      .populate("deliveryBoyId", "fullName mobile")
      .lean();

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const isOwner = String(order.userId) === String(req.user._id);
    const isDeliveryBoy = String(order.deliveryBoyId?._id || order.deliveryBoyId) === String(req.user._id);
    const isPrivileged = ["Admin", "RestaurantOwner"].includes(req.user.role);
    if (!isOwner && !isDeliveryBoy && !isPrivileged) {
      return res.status(403).json({ success: false, message: "Not allowed to track this order." });
    }

    const deliveryBoyLocation = order.deliveryBoyLocation?.lat !== undefined
      ? {
          lat: Number(order.deliveryBoyLocation.lat),
          lng: Number(order.deliveryBoyLocation.lng),
        }
      : null;

    const route = buildDeliveryRoute({
      restaurantLocation: order.restaurantLocation,
      userLocation: order.deliveryLocation,
      deliveryBoyLocation,
    });

    return res.status(200).json({
      success: true,
      tracking: {
        orderId: order._id,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        userLocation: order.deliveryLocation,
        restaurantLocation: order.restaurantLocation,
        deliveryBoyLocation,
        routePath: order.routePath?.length ? order.routePath : route.routePath,
        routeDistanceKm: route.distanceKm,
        deliveryBoy: order.deliveryBoyId || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch tracking.",
      error: error.message,
    });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id })
      .populate("restaurantId", "name image cuisineType")
      .populate("items.itemId", "name price")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch your orders.",
      error: error.message,
    });
  }
};
