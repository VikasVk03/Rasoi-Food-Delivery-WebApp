import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import RestaurantCard from "../components/RestaurantCard";
import { Context } from "../main";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import DeliveryMap from "../components/DeliveryMap";
import { getSocket } from "../socket";
import MenuCard from "../components/MenuCard";

const FALLBACK_LOCATION = { lat: 19.076, lng: 72.8777 };

const getTimeBucket = (date = new Date()) => {
  const hour = date.getHours();
  if (hour >= 5 && hour < 11) return "breakfast";
  if (hour >= 11 && hour < 16) return "lunch";
  if (hour >= 16 && hour < 22) return "dinner";
  return "late-night";
};

const filters = [
  { label: "All", value: "all" },
  { label: "Veg", value: "veg" },
  { label: "Jain", value: "jain" },
  { label: "Non-Veg", value: "non-veg" },
];

const Home = () => {
  const { isAuthenticated, user } = useContext(Context);
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [trackingOrderId, setTrackingOrderId] = useState("");
  const [trackingData, setTrackingData] = useState(null);
  const [userLocation, setUserLocation] = useState(FALLBACK_LOCATION);
  const [deviceType, setDeviceType] = useState("desktop");
  const [recommendations, setRecommendations] = useState([]);
  const [foodRecommendations, setFoodRecommendations] = useState([]);
  const [sessionId] = useState(
    () => window.localStorage.getItem("rasoi:session-id") || crypto.randomUUID(),
  );

  useEffect(() => {
    window.localStorage.setItem("rasoi:session-id", sessionId);
    const ua = navigator.userAgent.toLowerCase();
    setDeviceType(/mobile|android|iphone/.test(ua) ? "mobile" : "desktop");
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setUserLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        }),
      () => {},
    );
  }, [sessionId]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "RestaurantOwner") {
      navigate("/owner/dashboard");
      return;
    }
    if (isAuthenticated && user?.role === "DeliveryBoy") {
      navigate("/delivery/dashboard");
      return;
    }
    if (isAuthenticated && user?.role === "Admin") {
      navigate("/admin/dashboard");
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    window.localStorage.setItem(`rasoi:search:${sessionId}`, debouncedSearch);
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await axios.get(`${serverUrl}/api/restaurants`, {
          params: {
            search: debouncedSearch || undefined,
            foodPreference: activeFilter,
          },
        });
        setRestaurants(data.restaurants || []);
      } catch (fetchError) {
        setError(fetchError.response?.data?.message || "Could not load restaurants");
        setRestaurants([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [debouncedSearch, activeFilter, sessionId]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "User") return;
    axios
      .get(`${serverUrl}/api/orders/my`, { withCredentials: true })
      .then((response) => setMyOrders(response.data.orders || []))
      .catch(() => setMyOrders([]));
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!trackingOrderId) return undefined;
    const socket = getSocket();
    socket.emit("tracking:join", { orderId: trackingOrderId });
    const onUpdate = (payload) => {
      if (String(payload.orderId) !== String(trackingOrderId)) return;
      setTrackingData((previous) => ({ ...(previous || {}), ...payload }));
    };
    socket.on("order:tracking:update", onUpdate);
    return () => {
      socket.emit("tracking:leave", { orderId: trackingOrderId });
      socket.off("order:tracking:update", onUpdate);
    };
  }, [trackingOrderId]);

  const popularRestaurants = useMemo(
    () => [...restaurants].sort((a, b) => (b.rating || 0) - (a.rating || 0)),
    [restaurants],
  );

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const favorites = (window.localStorage.getItem("rasoi:favorites") || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .join(",");
        const searchHistory = (window.localStorage.getItem(`rasoi:search:${sessionId}`) || "")
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean)
          .join(",");
        const { data } = await axios.get(`${serverUrl}/api/restaurants/recommendations`, {
          params: {
            search: debouncedSearch || undefined,
            foodPreference: activeFilter,
            lat: userLocation.lat,
            lng: userLocation.lng,
            timeBucket: getTimeBucket(),
            deviceType,
            sessionId,
            searchHistory: searchHistory || undefined,
            favorites: favorites || undefined,
          },
          withCredentials: true,
        });
        setRecommendations(data.recommendations || []);
      } catch {
        setRecommendations([]);
      }
    };
    fetchRecommendations();
  }, [activeFilter, debouncedSearch, deviceType, sessionId, userLocation]);

  useEffect(() => {
    const fetchFoodRecommendations = async () => {
      try {
        const favorites = (window.localStorage.getItem("rasoi:favorites") || "")
          .split(",")
          .map((id) => id.trim())
          .filter(Boolean)
          .join(",");
        const searchHistory = (window.localStorage.getItem(`rasoi:search:${sessionId}`) || "")
          .split(",")
          .map((item) => item.trim().toLowerCase())
          .filter(Boolean)
          .join(",");
        const { data } = await axios.get(`${serverUrl}/api/restaurants/recommendations/foods`, {
          params: {
            search: debouncedSearch || undefined,
            foodPreference: activeFilter,
            lat: userLocation.lat,
            lng: userLocation.lng,
            timeBucket: getTimeBucket(),
            sessionId,
            searchHistory: searchHistory || undefined,
            favorites: favorites || undefined,
          },
          withCredentials: true,
        });
        setFoodRecommendations(data.recommendations || []);
      } catch {
        setFoodRecommendations([]);
      }
    };
    fetchFoodRecommendations();
  }, [activeFilter, debouncedSearch, sessionId, userLocation]);

  const openRestaurantDetail = (restaurant) => {
    if (!restaurant?._id) return;
    const favorites = new Set(
      (window.localStorage.getItem("rasoi:favorites") || "")
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    );
    favorites.add(String(restaurant._id));
    window.localStorage.setItem("rasoi:favorites", Array.from(favorites).join(","));
    navigate(`/restaurants/${restaurant._id}/menu`, { state: { restaurant } });
  };

  const fetchOrderTracking = async (orderId) => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/orders/${orderId}/tracking`, {
        withCredentials: true,
      });
      setTrackingOrderId(orderId);
      setTrackingData(data.tracking);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch tracking");
    }
  };

  return (
    <main className="min-h-screen bg-[#fff9f6]">
      <SiteHeader />
      <section className="py-8 px-4 max-w-6xl mx-auto">
        <div className="mt-6 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search restaurants..."
            className="w-full rounded-lg border border-gray-200 px-4 py-2 outline-none focus:ring-2 focus:ring-orange-200"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer ${
                  activeFilter === filter.value
                    ? "bg-[#ff4d2d] text-white border-[#ff4d2d]"
                    : "bg-white text-gray-700 border-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Recommended Food Items</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tap any dish to open full restaurant details and menu.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {foodRecommendations.slice(0, 6).map((item) => (
              <button
                key={`food-${item._id}`}
                type="button"
                className="text-left cursor-pointer"
                onClick={() => openRestaurantDetail(item.restaurant)}
              >
                <MenuCard item={item} />
                <p className="text-xs text-gray-500 mt-1">
                  {item.restaurant?.name} | Score {item.recommendationMeta?.score?.toFixed(3)} |{" "}
                  {item.recommendationMeta?.distanceKm} km
                </p>
              </button>
            ))}
            {!foodRecommendations.length && (
              <p className="text-sm text-gray-500">Food recommendations will appear here based on context.</p>
            )}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">Popular Near You</h2>
          {loading && <div className="mt-4 text-gray-600">Loading restaurants...</div>}
          {!loading && error && (
            <div className="mt-4 bg-red-50 text-red-700 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}
          {!loading && !error && popularRestaurants.length > 0 && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {popularRestaurants.map((restaurant) => (
                <button
                  key={restaurant._id}
                  type="button"
                  className="text-left cursor-pointer"
                  onClick={() => openRestaurantDetail(restaurant)}
                >
                  <RestaurantCard restaurant={restaurant} />
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900">
            {isAuthenticated && user?.role === "User" ? "Personalized For You" : "Recommended Right Now"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ranked by popularity, proximity, time relevance, session context, and your activity.
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recommendations.slice(0, 6).map((restaurant) => (
              <button
                key={`rec-${restaurant._id}`}
                type="button"
                className="text-left cursor-pointer"
                onClick={() => openRestaurantDetail(restaurant)}
              >
                <RestaurantCard restaurant={restaurant} />
                <p className="text-xs text-gray-500 mt-1">
                  Score {restaurant.recommendationMeta.score.toFixed(3)} | {restaurant.recommendationMeta.distanceKm} km |{" "}
                  {restaurant.recommendationMeta.timeBucket}
                </p>
              </button>
            ))}
            {!recommendations.length && <p className="text-sm text-gray-500">Recommendations will appear after loading data.</p>}
          </div>
        </section>

        {isAuthenticated && user?.role === "User" ? (
          <section className="mt-8 grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold mb-2">Recent Orders</h3>
              <div className="space-y-2 max-h-80 overflow-auto">
                {myOrders.map((order) => (
                  <div key={order._id} className="border border-gray-100 rounded-lg p-3 text-sm">
                    <p className="font-medium">{order.restaurantId?.name}</p>
                    <p className="text-xs text-gray-500">
                      Rs {order.totalPrice} | Status: {order.status}
                    </p>
                    <button
                      type="button"
                      onClick={() => fetchOrderTracking(order._id)}
                      className="mt-2 text-xs text-blue-600 cursor-pointer"
                    >
                      Track Live
                    </button>
                  </div>
                ))}
                {!myOrders.length && <p className="text-sm text-gray-500">No orders yet.</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-semibold mb-2">Live Tracking</h3>
              {trackingData ? (
                <DeliveryMap
                  lat={Number(trackingData.userLocation?.lat || 28.6139)}
                  lng={Number(trackingData.userLocation?.lng || 77.209)}
                  markers={[
                    {
                      label: "You",
                      lat: Number(trackingData.userLocation?.lat || 28.6139),
                      lng: Number(trackingData.userLocation?.lng || 77.209),
                    },
                    {
                      label: "Restaurant",
                      lat: Number(trackingData.restaurantLocation?.lat || 28.6139),
                      lng: Number(trackingData.restaurantLocation?.lng || 77.209),
                    },
                    ...(trackingData.deliveryBoyLocation
                      ? [
                          {
                            label: "Delivery Boy",
                            lat: Number(trackingData.deliveryBoyLocation.lat),
                            lng: Number(trackingData.deliveryBoyLocation.lng),
                          },
                        ]
                      : []),
                  ]}
                  routePath={trackingData.routePath || []}
                />
              ) : (
                <p className="text-sm text-gray-500">Choose an order to watch live tracking.</p>
              )}
            </div>
          </section>
        ) : (
          <section className="mt-8 bg-white rounded-xl border border-gray-100 p-4">
            <h2 className="text-lg font-semibold">Login to Order</h2>
            <p className="text-sm text-gray-600 mt-2">
              Browse restaurants freely. Login as user for cart, checkout, and live order tracking.
            </p>
            <div className="mt-4 flex gap-3">
              <Link to="/login" className="px-4 py-2 rounded-lg border border-[#ff4d2d] text-[#ff4d2d]">
                Login
              </Link>
              <Link to="/signup" className="px-4 py-2 rounded-lg bg-[#ff4d2d] text-white">
                Signup
              </Link>
            </div>
          </section>
        )}
      </section>
      <SiteFooter />
    </main>
  );
};

export default Home;
