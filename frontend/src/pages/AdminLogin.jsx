import React, { useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../App";
import { Context } from "../main";

const AdminLogin = () => {
  const { setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@rasoi.com");
  const [password, setPassword] = useState("123456789");

  const handleAdminLogin = async () => {
    try {
      const { data } = await axios.post(
        `${serverUrl}/api/auth/admin/login`,
        { email, password },
        { withCredentials: true },
      );
      setIsAuthenticated(true);
      setUser(data.user);
      toast.success("Admin login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <main className="min-h-screen bg-[#fff9f6] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-100 p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold text-[#ff4d2d]">Admin Login</h1>
        <p className="text-sm text-gray-600 mt-1">Restricted access for Rasoi administrator</p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <input
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            onClick={handleAdminLogin}
            className="w-full rounded-lg bg-[#ff4d2d] text-white py-2 cursor-pointer"
          >
            Login as Admin
          </button>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
