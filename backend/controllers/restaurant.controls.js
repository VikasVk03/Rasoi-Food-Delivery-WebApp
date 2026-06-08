import jwt from "jsonwebtoken";
import Menu from "../models/menu.model.js";
import Order from "../models/order.model.js";
import Restaurant from "../models/restaurant.model.js";
import User from "../models/users.model.js";

const validPreferences = new Set(["all", "veg", "jain", "non-veg"]);

const getPreferenceQuery = (foodPreference) => {
  if (foodPreference === "veg") return { isVeg: true };
  if (foodPreference === "jain") return { isJain: true };
  if (foodPreference === "non-veg") return { isVeg: false };
  return {};
};

const getPreferenceFromToken = async (token) => {
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("foodPreference").lean();
    return user?.foodPreference || null;
  } catch {
    return null;
  }
};

const getUserFromToken = async (token) => {
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return User.findById(decoded.id).select("_id").lean();
  } catch {
    return null;
  }
};

const haversineKm = (pointA, pointB) => {
  const toRad = (value) => (Number(value) * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad((pointB?.lat || 0) - (pointA?.lat || 0));
  const dLng = toRad((pointB?.lng || 0) - (pointA?.lng || 0));
  const lat1 = toRad(pointA?.lat || 0);
  const lat2 = toRad(pointB?.lat || 0);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getTimeBucket = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 22) return "dinner";
  return "late-night";
};

export const getRestaurants = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const queryPreference = req.query.foodPreference?.toLowerCase();
    const tokenPreference = await getPreferenceFromToken(req.cookies?.token);

    const effectivePreference = validPreferences.has(queryPreference)
      ? queryPreference
      : validPreferences.has(tokenPreference)
        ? tokenPreference
        : "all";

    const restaurantFilter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};

    const restaurants = await Restaurant.find(restaurantFilter)
      .sort({ rating: -1, createdAt: -1 })
      .lean();

    if (!restaurants.length) {
      return res.status(200).json({
        success: true,
        preferenceUsed: effectivePreference,
        restaurants: [],
      });
    }

    const restaurantIds = restaurants.map((restaurant) => restaurant._id);
    const menuPreferenceQuery = getPreferenceQuery(effectivePreference);

    const menus = await Menu.find({
      restaurantId: { $in: restaurantIds },
      ...menuPreferenceQuery,
    })
      .select("name price category isVeg isJain restaurantId image")
      .sort({ createdAt: -1 })
      .lean();

    const menuMap = menus.reduce((acc, item) => {
      const key = item.restaurantId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const restaurantsWithMenuPreview = restaurants
      .map((restaurant) => {
        const preview = menuMap[restaurant._id.toString()] || [];
        return {
          ...restaurant,
          menuPreview: preview.slice(0, 4),
        };
      })
      .filter((restaurant) =>
        effectivePreference === "all" ? true : restaurant.menuPreview.length > 0,
      );

    return res.status(200).json({
      success: true,
      preferenceUsed: effectivePreference,
      restaurants: restaurantsWithMenuPreview,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants.",
      error: error.message,
    });
  }
};

export const getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const queryPreference = req.query.foodPreference?.toLowerCase();
    const tokenPreference = await getPreferenceFromToken(req.cookies?.token);

    const effectivePreference = validPreferences.has(queryPreference)
      ? queryPreference
      : validPreferences.has(tokenPreference)
        ? tokenPreference
        : "all";

    const menuPreferenceQuery = getPreferenceQuery(effectivePreference);

    const menu = await Menu.find({
      restaurantId,
      ...menuPreferenceQuery,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      preferenceUsed: effectivePreference,
      menu,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu.",
      error: error.message,
    });
  }
};

export const getRecommendedRestaurants = async (req, res) => {
  try {
    const search = req.query.search?.trim() || "";
    const queryPreference = req.query.foodPreference?.toLowerCase();
    const tokenPreference = await getPreferenceFromToken(req.cookies?.token);
    const effectivePreference = validPreferences.has(queryPreference)
      ? queryPreference
      : validPreferences.has(tokenPreference)
        ? tokenPreference
        : "all";

    const userLocation = {
      lat: Number(req.query.lat || 19.076),
      lng: Number(req.query.lng || 72.8777),
    };
    const timeBucket = req.query.timeBucket || getTimeBucket();
    const deviceType = req.query.deviceType || "desktop";
    const searchHistory = String(req.query.searchHistory || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const favoriteIds = new Set(
      String(req.query.favorites || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );

    const restaurantFilter = search
      ? { name: { $regex: search, $options: "i" } }
      : {};
    const restaurants = await Restaurant.find(restaurantFilter).lean();
    if (!restaurants.length) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    const restaurantIds = restaurants.map((restaurant) => restaurant._id);
    const menuPreferenceQuery = getPreferenceQuery(effectivePreference);
    const menus = await Menu.find({
      restaurantId: { $in: restaurantIds },
      ...menuPreferenceQuery,
    })
      .select("name price category isVeg isJain restaurantId image")
      .lean();

    const menuMap = menus.reduce((acc, item) => {
      const key = item.restaurantId.toString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    }, {});

    const tokenUser = await getUserFromToken(req.cookies?.token);
    const userOrders = tokenUser
      ? await Order.find({ userId: tokenUser._id })
          .populate("restaurantId", "cuisineType")
          .select("restaurantId")
          .lean()
      : [];

    const userCuisineWeights = {};
    userOrders.forEach((order) => {
      const cuisine = order.restaurantId?.cuisineType || "other";
      userCuisineWeights[cuisine] = (userCuisineWeights[cuisine] || 0) + 1;
    });

    const recommendations = restaurants
      .map((restaurant) => {
        const preview = menuMap[restaurant._id.toString()] || [];
        const menuCategories = preview.map((item) =>
          String(item.category || "").toLowerCase(),
        );
        const distanceKm = haversineKm(userLocation, restaurant.location || userLocation);
        const normalizedProximity = 1 / (1 + distanceKm);
        const normalizedPopularity = Math.max(0, Math.min((restaurant.rating || 0) / 5, 1));

        // Context-aware score with meal-time relevance.
        const timeCategoryMatch =
          (timeBucket === "breakfast" && menuCategories.some((c) => c.includes("breakfast"))) ||
          (timeBucket === "lunch" && menuCategories.some((c) => c.includes("main"))) ||
          (timeBucket === "dinner" && menuCategories.some((c) => c.includes("dinner") || c.includes("main")))
            ? 1
            : 0.35;

        // Content-based score using search/favorites.
        const contentMatch = searchHistory.some(
          (term) =>
            restaurant.name?.toLowerCase().includes(term) ||
            restaurant.cuisineType?.toLowerCase().includes(term),
        )
          ? 1
          : 0.4;
        const favoriteBoost = favoriteIds.has(String(restaurant._id)) ? 1 : 0;

        // Collaborative signal from user historical cuisine choices.
        const cuisineAffinity = userCuisineWeights[restaurant.cuisineType] || 0;
        const collaborativeSignal = userOrders.length
          ? Math.min(cuisineAffinity / userOrders.length, 1)
          : 0.3;

        // Hybrid ranking formula (weighted linear model).
        const score =
          normalizedPopularity * 0.28 +
          normalizedProximity * 0.27 +
          timeCategoryMatch * 0.17 +
          contentMatch * 0.12 +
          collaborativeSignal * 0.11 +
          favoriteBoost * 0.05;

        return {
          ...restaurant,
          menuPreview: preview.slice(0, 4),
          recommendationMeta: {
            score,
            distanceKm: Number(distanceKm.toFixed(2)),
            timeBucket,
            deviceType,
          },
        };
      })
      .sort((a, b) => b.recommendationMeta.score - a.recommendationMeta.score);

    return res.status(200).json({
      success: true,
      preferenceUsed: effectivePreference,
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to build recommendations.",
      error: error.message,
    });
  }
};

export const getRecommendedFoodItems = async (req, res) => {
  try {
    const queryPreference = req.query.foodPreference?.toLowerCase();
    const tokenPreference = await getPreferenceFromToken(req.cookies?.token);
    const effectivePreference = validPreferences.has(queryPreference)
      ? queryPreference
      : validPreferences.has(tokenPreference)
        ? tokenPreference
        : "all";

    const search = req.query.search?.trim()?.toLowerCase() || "";
    const userLocation = {
      lat: Number(req.query.lat || 19.076),
      lng: Number(req.query.lng || 72.8777),
    };
    const timeBucket = req.query.timeBucket || getTimeBucket();
    const searchHistory = String(req.query.searchHistory || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
    const favoriteIds = new Set(
      String(req.query.favorites || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    );

    const menuPreferenceQuery = getPreferenceQuery(effectivePreference);
    const allMenus = await Menu.find({ ...menuPreferenceQuery })
      .populate("restaurantId", "name cuisineType location image rating")
      .lean();

    if (!allMenus.length) {
      return res.status(200).json({ success: true, recommendations: [] });
    }

    const tokenUser = await getUserFromToken(req.cookies?.token);
    const userOrders = tokenUser
      ? await Order.find({ userId: tokenUser._id })
          .populate({
            path: "items.itemId",
            select: "name category isVeg isJain restaurantId",
          })
          .lean()
      : [];

    const orderedItemWeights = {};
    userOrders.forEach((order) => {
      (order.items || []).forEach((line) => {
        const item = line.itemId;
        if (!item?._id) return;
        const key = String(item._id);
        orderedItemWeights[key] = (orderedItemWeights[key] || 0) + Number(line.quantity || 1);
      });
    });

    const recommendations = allMenus
      .filter((menuItem) => {
        if (!search) return true;
        return (
          String(menuItem.name || "").toLowerCase().includes(search) ||
          String(menuItem.category || "").toLowerCase().includes(search) ||
          String(menuItem.restaurantId?.name || "").toLowerCase().includes(search)
        );
      })
      .map((menuItem) => {
        const restaurant = menuItem.restaurantId || {};
        const distanceKm = haversineKm(userLocation, restaurant.location || userLocation);
        const normalizedProximity = 1 / (1 + distanceKm);
        const popularity = Math.max(0, Math.min((restaurant.rating || 0) / 5, 1));

        // Context-aware score: boosts item categories by meal-time intent.
        const category = String(menuItem.category || "").toLowerCase();
        const timeCategoryMatch =
          (timeBucket === "breakfast" && category.includes("breakfast")) ||
          (timeBucket === "lunch" && (category.includes("main") || category.includes("thali"))) ||
          (timeBucket === "dinner" && (category.includes("main") || category.includes("dinner")))
            ? 1
            : 0.35;

        // Content-based score: matches current/session search terms against food metadata.
        const contentMatch = searchHistory.some(
          (term) =>
            String(menuItem.name || "").toLowerCase().includes(term) ||
            String(menuItem.category || "").toLowerCase().includes(term) ||
            String(restaurant.cuisineType || "").toLowerCase().includes(term),
        )
          ? 1
          : 0.4;

        // Collaborative-like score: estimate taste similarity from previous item interactions.
        const collaborativeSignal = userOrders.length
          ? Math.min((orderedItemWeights[String(menuItem._id)] || 0) / Math.max(userOrders.length, 1), 1)
          : 0.3;
        const favoriteBoost = favoriteIds.has(String(restaurant._id)) ? 1 : 0;

        // Hybrid weighted formula.
        const score =
          popularity * 0.25 +
          normalizedProximity * 0.24 +
          timeCategoryMatch * 0.18 +
          contentMatch * 0.14 +
          collaborativeSignal * 0.14 +
          favoriteBoost * 0.05;

        return {
          ...menuItem,
          restaurant,
          recommendationMeta: {
            score,
            distanceKm: Number(distanceKm.toFixed(2)),
            timeBucket,
          },
        };
      })
      .sort((a, b) => b.recommendationMeta.score - a.recommendationMeta.score)
      .slice(0, 12);

    return res.status(200).json({
      success: true,
      preferenceUsed: effectivePreference,
      recommendations,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to build food recommendations.",
      error: error.message,
    });
  }
};
