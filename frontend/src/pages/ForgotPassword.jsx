import axios from "axios";
import { useContext, useState } from "react";
import { toast } from "react-toastify";
import { Navigate, useNavigate } from "react-router-dom";
import { Context } from "../main";
import { serverUrl } from "../App";

function ForgotPassword() {
  const { isAuthenticated } = useContext(Context);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    setLoading(true);
    await axios
      .post(
        `${serverUrl}/api/auth/password/forgot`,
        { email },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((res) => {
        toast.success(res.data.message || "Reset link sent to your email!");
        setEmail("");
      })
      .catch((error) => {
        const message =
          error.response?.data?.message || "Something went wrong!";

        toast.error(message);
      })
      .finally(() => setLoading(false));
  };

  // *  if user authenticated do not open forgot password page
  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-slate-400 shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
          🔑 Forgot Password
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter your registered email and we’ll send you a{" "}
          <span className="font-semibold text-[#ff4d2d]">reset link</span>.
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-5">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2  focus:ring-[#e64323]  focus:border-[#ddd] outline-none transition duration-200"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 bg-[#ff4d2d] hover:bg-[#e64323] hover:text-white text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-200 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p className="text-center mt-4">
          Not registered?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-[#ff4d2d] font-semibold cursor-pointer"
          >
            Create Account
          </span>
        </p>

        <p className="text-center  text-gray-700 mt-4">
          Remembered your password?{" "}
          <a
            onClick={() => navigate("/login")}
            className="text-[#ff4d2d] font-semibold hover:underline cursor-pointer"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;
