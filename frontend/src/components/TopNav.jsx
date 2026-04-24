import React, { useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import { Context } from "../main";

const TopNav = ({ title }) => {
  const { user, setUser, setIsAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/auth/logout`, {
        withCredentials: true,
      });
      toast.success(data.message || "Logged out");
      setUser(null);
      setIsAuthenticated(false);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };

  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#ff4d2d]">{title}</h1>
          <p className="text-xs text-gray-500">{user?.role || "Guest"}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-[#ff4d2d] hover:bg-[#e64323] hover:text-white text-white font-semibold text-sm cursor-pointer"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopNav;
