import { useState } from "react";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverUrl } from "../App";
import { toast } from "react-toastify";

function SignUp() {
  const primaryColor = "#ff4d2d";
  // const hoverColor = "#e64323";
  const bgColor = "#fff9f6";
  const borderColor = "#ddd";

  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("User");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (loading) return;

    if (!fullName || !email || !password || !mobile) {
      toast.error("All fields are required");
      return;
    }

    const formattedMobile = mobile.replace(/\D/g, "").slice(-10);

    if (!/^[6-9]\d{9}$/.test(formattedMobile)) {
      toast.error("Enter a valid Indian mobile number");
      return;
    }

    try {
      setLoading(true);

      await axios
        .post(
          `${serverUrl}/api/auth/signup`,
          {
            fullName,
            email,
            password,
            mobile,
            role,
          },
          {
            withCredentials: true,
            headers: { "Content-Type": "application/json" },
          },
        )
        .then(() => {
          toast.success("Signup successful!");
          navigate(`/otp-verification/${email}`);
        });
    } catch (error) {
      let message = "Signup failed.";

      const data = error?.response?.data;

      if (typeof data === "string") {
        const match = data.match(/Error:\s*(.*?)<br>/);
        if (match) message = match[1];
      } else {
        message = data?.message || data?.error || error.message || message;
      }

      if (message.toLowerCase().includes("email")) {
        toast.error("Email already registered. Please login.");

        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        toast.error(message);
      }
    } finally {
      setLoading(false);
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
          Create Your Account To Get Started With Delicious Food Deliveries
        </p>
        {/* fullname */}

        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 font-medium mb-1"
          >
            Full Name
          </label>
          <input
            type="text"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none "
            placeholder="Enter your Full Name"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setFullName(e.target.value)}
            value={fullName}
            name=""
            id=""
          />
        </div>

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

        {/* Mobile Number */}

        <div className="mb-4">
          <label
            htmlFor="mobile"
            className="block text-gray-700 font-medium mb-1"
          >
            Mobile
          </label>
          <input
            type="tel"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none "
            placeholder="Enter 10-digit mobile"
            style={{ border: `1px solid ${borderColor}` }}
            onChange={(e) => setMobile(e.target.value)}
            value={mobile}
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
              onClick={(e) => {
                e.preventDefault();
                setShowPassword((prev) => !prev);
              }}
            >
              {!showPassword ? <FaRegEye /> : <FaRegEyeSlash />}
            </button>
          </div>
        </div>
        {/* Roles */}

        <div className="mb-4">
          <label
            htmlFor="role"
            className="block text-gray-700 font-medium mb-1"
          >
            Role
          </label>
          <div className=" flex gap-3">
            {["User", "RestaurantOwner", "DeliveryBoy"].map((r) => (
              <button
                key={r}
                className="flex-1 border rounded-lg px-3 py-2 text-center font-medium transition-colors cursor-pointer"
                onClick={() => setRole(r)}
                style={
                  role == r
                    ? { backgroundColor: primaryColor, color: "white" }
                    : {
                        border: `1px solid ${primaryColor}`,
                        color: primaryColor,
                      }
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <button
          className={`w-full font-semibold  rounded-lg py-2 transition duration-200 bg-[#ff4d2d] text-white hover:bg-[#e64323] cursor-pointer`}
          onClick={handleSignUp}
        >
          Sign Up
        </button>
        <p className="text-center mt-4" onClick={() => navigate("/login")}>
          Already have an account?{" "}
          <span className="text-[#ff4d2d] hover:text-[#e64323] cursor-pointer font-semibold">
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
