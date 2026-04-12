import React, { useContext, useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { Context } from "../main";
import { toast } from "react-toastify";

function Login() {
  const { setIsAuthenticated, setUser } = useContext(Context);

  const primaryColor = "#ff4d2d";
  // const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const result = await axios
        .post(
          `${serverUrl}/api/auth/login`,
          {
            email,
            password,
          },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
            },
          },
        )
        .then((res) => {
          toast.success(res.data.message, {
            onClose: () => navigate("/"),
            autoClose: 2000,
          });
          setIsAuthenticated(true);
          setUser(res.data.user);
          navigate("/");
        });
      console.log(`Remove this log after completion`);
      console.log(result);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 "
      style={{ backgroundColor: bgColor }}
    >
      <div
        className={`bg-white rounded-xl shadow-lg w-full max-w-md p-8 border`}
        style={{ border: `1px solid ${borderColor}` }}
      >
        <h1
          className={`text-3xl font-bold mb-2`}
          style={{ color: primaryColor }}
        >
          Rasoi
        </h1>
        <p className={`text-gray-600 mb-8`}>
          Login into Your Account To Get Started With Delicious Food Deliveries
        </p>

        {/* Email */}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 font-medium mb-1"
          >
            Email
          </label>
          <input
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none "
            placeholder="Enter your Email"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            name=""
            id=""
          />
        </div>

        {/* Password */}

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 font-medium mb-1"
          >
            Password
          </label>
          <div className="relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="w-full border rounded-lg px-3 py-2 focus:outline-none "
              placeholder="Enter New Password"
              style={{ border: `1px solid ${borderColor}` }}
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              name=""
              id=""
            />
            <button
              className="absolute right-3 cursor-pointer top-3.75 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>

        <div
          className={`text-right mb-4 text-[#ff4d2d] font-medium hover:text-[#e64323] cursor-pointer`}
          onClick={() => {
            console.log("Forgot Password clicked");
            navigate("/password/forgot");
          }}
        >
          Forgot Password?
        </div>

        <button
          className={`w-full font-semibold  rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleLogin}
        >
          Login
        </button>
        <p className="text-center mt-4" onClick={() => navigate("/signup")}>
          Want to create New Account?{" "}
          <span className="text-[#ff4d2d] hover:text-[#e64323] cursor-pointer font-semibold">
            Signup
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
