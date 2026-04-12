import { Context } from "../main";
import axios from "axios";
import { useContext, useState } from "react";
import { Navigate, useParams, useNavigate } from "react-router-dom";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";
import { toast } from "react-toastify";
import { serverUrl } from "../App";

function ResetPassword() {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const { token } = useParams();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    await axios
      .put(
        `${serverUrl}/api/auth/password/reset/${token}`,
        { password, confirmPassword },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((res) => {
        toast.success(
          res.data.message ||
            "Password updated successfully. Please login again",
        );

        setTimeout(() => {
          navigate("/");
        }, 2000);
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || "Reset failed!");
        setIsAuthenticated(false);
        setUser(null);

        // ✅ Redirect user to login after short delay
        /*  setTimeout(() => {
          navigate("/login");
        }, 10000); */
      })
      .finally(() => setLoading(false));
  };

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fff9f6] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-slate-400 shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
          🔒 Reset Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your new password below.
        </p>

        <form onSubmit={handleResetPassword} className="space-y-5">
          {/* New Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={`${showPassword ? "text" : "password"}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#e64323] focus:border-[#ddd] outline-none transition duration-200"
              />

              <button
                className="absolute right-3 cursor-pointer top-3.75 text-gray-500"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword((prev) => !prev);
                }}
              >
                {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={`${showPassword ? "text" : "password"}`}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#e64323] focus:border-[#ddd] outline-none transition duration-200"
              />

              <button
                className="absolute right-3 cursor-pointer top-3.75 text-gray-500"
                onClick={(e) => {
                  e.preventDefault();
                  setShowPassword((prev) => !prev);
                }}
              >
                {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-[#ff4d2d] hover:bg-[#e64323] text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-200 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
