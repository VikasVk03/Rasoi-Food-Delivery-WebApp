import React from "react";
import { Route, Routes } from "react-router-dom";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import OtpVerification from "./pages/OtpVerification";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Home from "./pages/Home";
import OwnerDashboard from "./pages/OwnerDashboard";
import DeliveryDashboard from "./pages/DeliveryDashboard";
import OwnerSetupRestaurant from "./pages/OwnerSetupRestaurant";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import RestaurantMenu from "./pages/RestaurantMenu";
import { Analytics } from "@vercel/analytics/react"

export const serverUrl = "https://rasoi-food-delivery-webapp.onrender.com";
// export const serverUrl = "http://localhost:8000";

const App = () => {
  return (
    <>
    <Analytics/>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/otp-verification/:email" element={<OtpVerification />} />
      <Route path="/login" element={<Login />} />
      <Route path="/password/forgot" element={<ForgotPassword />} />
      <Route path="/password/reset/:token" element={<ResetPassword />} />
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
      <Route path="/owner/setup" element={<OwnerSetupRestaurant />} />
      <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/restaurants/:restaurantId/menu" element={<RestaurantMenu />} />
    </Routes>
    </>
  );
};

export default App;
