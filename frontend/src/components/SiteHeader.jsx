import React, { useContext } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import { Context } from "../main";

const SiteHeader = () => {
  const { isAuthenticated, user, setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();

  const getDashboardPath = () => {
    if (user?.role === "RestaurantOwner") return "/owner/dashboard";
    if (user?.role === "DeliveryBoy") return "/delivery/dashboard";
    return "/";
  };

  const logout = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      setIsAuthenticated(false);
      setUser(null);
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link to="/" className="text-2xl font-bold text-[#ff4d2d]">
          Rasoi
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700"
          >
            Home
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardPath()}
                className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-sm px-3 py-1.5 rounded-lg bg-[#ff4d2d] hover:bg-[#e64323] hover:text-white text-white font-semibold cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm px-3 py-1.5 rounded-lg border border-[#ff4d2d] text-[#ff4d2d]"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="text-sm px-3 py-1.5 rounded-lg bg-[#ff4d2d] text-white"
              >
                Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
