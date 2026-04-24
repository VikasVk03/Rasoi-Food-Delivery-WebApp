import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import { Context } from "../main";

const OwnerSetupRestaurant = () => {
  const { isAuthenticated, user } = useContext(Context);
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    cuisineType: "",
    image: "",
    isOpen: true,
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (user?.role !== "RestaurantOwner") {
      navigate("/");
      return;
    }

    axios
      .get(`${serverUrl}/api/owner/restaurant-status`, { withCredentials: true })
      .then((response) => {
        if (response.data.hasRestaurant) {
          navigate("/owner/dashboard");
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [isAuthenticated, navigate, user]);

  const createRestaurant = async () => {
    if (submitting) return;
    try {
      setSubmitting(true);
      await axios.post(
        `${serverUrl}/api/owner/restaurant`,
        {
          name: form.name,
          cuisineType: form.cuisineType,
          image: form.image,
          isOpen: form.isOpen,
          location: { lat: Number(form.lat), lng: Number(form.lng) },
        },
        { withCredentials: true },
      );
      toast.success("Restaurant created successfully");
      navigate("/owner/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create restaurant");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fff9f6]">
      <SiteHeader />
      <section className="max-w-2xl mx-auto px-4 py-10">
        {checking ? (
          <p>Checking owner setup...</p>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-[#ff4d2d]">Create Your Restaurant</h1>
            <p className="text-sm text-gray-500 mt-1">
              Complete this once to start managing your menu and orders.
            </p>
            <div className="grid gap-3 mt-5">
              <input
                className="border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Restaurant Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
              />
              <input
                className="border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Cuisine Type"
                value={form.cuisineType}
                onChange={(event) => setForm({ ...form, cuisineType: event.target.value })}
              />
              <input
                className="border border-gray-200 rounded-lg px-3 py-2"
                placeholder="Image URL (optional)"
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="Latitude"
                  type="number"
                  value={form.lat}
                  onChange={(event) => setForm({ ...form, lat: event.target.value })}
                />
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2"
                  placeholder="Longitude"
                  type="number"
                  value={form.lng}
                  onChange={(event) => setForm({ ...form, lng: event.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isOpen}
                  onChange={(event) => setForm({ ...form, isOpen: event.target.checked })}
                />
                Mark restaurant as open
              </label>
              <button
                type="button"
                onClick={createRestaurant}
                className="mt-2 bg-[#ff4d2d] text-white rounded-lg py-2 cursor-pointer disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create Restaurant"}
              </button>
            </div>
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
};

export default OwnerSetupRestaurant;
