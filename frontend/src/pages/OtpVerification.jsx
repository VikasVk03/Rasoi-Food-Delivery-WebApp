import { Context } from "../main";
import axios from "axios";
import React, { useContext, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { serverUrl } from "../App";

const OtpVerification = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);

  const [loading, setLoading] = useState(false);

  const { email } = useParams();

  const [otp, setOtp] = useState(["", "", "", "", ""]);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`).focus();
    }
  };

  const handleKeyDown = (value, index) => {
    if (value.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handleOtpVerification = async (e) => {
    e.preventDefault();

    if (loading) return;

    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 5) {
      toast.error("Please enter complete OTP");
      return;
    }

    try {
      setLoading(true);

      const { data } = await axios.post(
        `${serverUrl}/api/auth/otp-verification`,
        {
          email,
          otp: enteredOtp,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      toast.success(data.message);
      toast.success("Please Login..");

      setIsAuthenticated(true);

      setUser(data.user);
    } catch (error) {
      let message = "OTP verification failed";

      const resData = error?.response?.data;

      if (typeof resData === "string") {
        const match = resData.match(/Error:\s*(.*?)<br>/);
        if (match) message = match[1];
      } else {
        message =
          resData?.message || resData?.error || error.message || message;
      }

      toast.error(message);

      setIsAuthenticated(false);

      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#fff9f6] px-4">
      <div className="w-full max-w-md bg-[#fff9f6] rounded-2xl shadow-slate-400 shadow-xl p-8">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-4">
          🔐 OTP Verification
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the <span className="font-semibold">5-digit OTP</span> sent to{" "}
          <span className="text-[#ff4d2d] font-semibold">{email}</span>.
        </p>

        <form onSubmit={handleOtpVerification} className="space-y-6">
          {/* OTP Inputs */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <input
                type="text"
                maxLength="1"
                key={index}
                id={`otp-input-${index}`}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ff4d2d] focus:border-[#ddd] outline-none transition duration-200"
              />
            ))}
          </div>

          {/* Verify Button*/}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#ff4d2d] hover:bg-[#e64323] hover:text-white text-white font-semibold rounded-lg shadow-lg transition-transform transform hover:scale-105 duration-200"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        {/* Resend OTP */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Didn’t receive OTP?{" "}
          <button
            onClick={() =>
              toast.error("Resend OTP functionality not implemented")
            }
            className="text-[#ff4d2d] font-medium hover:underline"
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default OtpVerification;
