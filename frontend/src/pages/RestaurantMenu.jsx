import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import MenuCard from "../components/MenuCard";
import { serverUrl } from "../App";
import { Context } from "../main";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

const RestaurantMenu = () => {
  const { restaurantId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useContext(Context);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState({ lat: 28.6139, lng: 77.209 });
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    axios
      .get(`${serverUrl}/api/restaurants/${restaurantId}/menu`)
      .then((response) => setMenu(response.data.menu || []))
      .catch((error) => toast.error(error.response?.data?.message || "Failed to load menu"))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  const addToCart = (item) => {
    setCart((previous) => ({ ...previous, [item._id]: (previous[item._id] || 0) + 1 }));
  };

  const total = useMemo(() => {
    const map = menu.reduce((acc, item) => ({ ...acc, [item._id]: item }), {});
    return Object.entries(cart).reduce(
      (sum, [itemId, qty]) => sum + (Number(map[itemId]?.price || 0) * qty),
      0,
    );
  }, [cart, menu]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setDeliveryLocation({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
        });
      },
      () => toast.error("Unable to capture location"),
    );
  };

  const checkoutWithFakePayment = async () => {
    if (!isAuthenticated || user?.role !== "User") {
      toast.info("Login as User to checkout");
      navigate("/login");
      return;
    }
    if (!deliveryAddress.trim()) {
      toast.error("Please enter delivery address");
      return;
    }
    const items = Object.entries(cart).map(([itemId, quantity]) => ({ itemId, quantity }));
    if (!items.length) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setPaying(true);
      await new Promise((resolve) => setTimeout(resolve, 1400));
      await axios.post(
        `${serverUrl}/api/orders`,
        {
          restaurantId,
          items,
          deliveryAddress,
          deliveryLocation,
          paymentMethod: "FAKE_UPI",
          paymentStatus: "paid",
        },
        { withCredentials: true },
      );
      toast.success("Payment successful and order placed");
      setCart({});
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Checkout failed");
    } finally {
      setPaying(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fff9f6]">
      <SiteHeader />
      <section className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-4">
          <h2 className="text-lg font-semibold">{state?.restaurant?.name || "Selected Restaurant"}</h2>
          <p className="text-sm text-gray-500 mb-4">{state?.restaurant?.cuisineType || "Menu listing"}</p>
          {loading ? (
            <p>Loading menu...</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {menu.map((item) => (
                <MenuCard key={item._id} item={item} onAdd={addToCart} />
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 p-4 h-fit">
          <h3 className="font-semibold">Cart & Checkout</h3>
          <div className="space-y-2 mt-3 text-sm">
            {Object.entries(cart).map(([itemId, qty]) => {
              const item = menu.find((menuItem) => menuItem._id === itemId);
              return (
                <div key={itemId} className="flex justify-between">
                  <span>{item?.name || "Item"} x {qty}</span>
                  <span>Rs {(Number(item?.price || 0) * qty).toFixed(2)}</span>
                </div>
              );
            })}
            {!Object.keys(cart).length && <p className="text-gray-500">Cart is empty.</p>}
          </div>
          <textarea
            rows={2}
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            placeholder="Delivery address"
            className="mt-3 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={useMyLocation}
            className="mt-2 text-xs border border-gray-300 px-3 py-1 rounded cursor-pointer"
          >
            Use Current Location
          </button>
          <p className="mt-3 font-semibold">Total: Rs {total.toFixed(2)}</p>
          <button
            type="button"
            onClick={checkoutWithFakePayment}
            disabled={paying}
            className="mt-3 w-full bg-[#ff4d2d] text-white py-2 rounded-lg disabled:opacity-70 cursor-pointer"
          >
            {paying ? "Processing Fake Payment..." : "Pay & Place Order"}
          </button>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
};

export default RestaurantMenu;
