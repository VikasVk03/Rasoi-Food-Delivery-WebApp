import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Order from "./models/order.model.js";
import User from "./models/users.model.js";
import Restaurant from "./models/restaurant.model.js";

let ioInstance = null;

const parseCookieToken = (cookieHeader = "") => {
  const tokenCookie = cookieHeader
    .split(";")
    .map((item) => item.trim())
    .find((item) => item.startsWith("token="));
  return tokenCookie ? tokenCookie.split("=")[1] : null;
};

export const initializeSocket = (httpServer) => {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: [process.env.FRONTEND_URL],
      credentials: true,
    },
  });

  ioInstance.use((socket, next) => {
    try {
      const token = parseCookieToken(socket.handshake.headers.cookie || "");
      if (!token) return next(new Error("Unauthorized"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.id };
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  ioInstance.on("connection", (socket) => {
    socket.on("tracking:join", async ({ orderId }) => {
      if (!orderId) return;
      const order = await Order.findById(orderId).select("userId deliveryBoyId restaurantId").lean();
      if (!order) return;
      const user = await User.findById(socket.user.id).select("role").lean();
      const restaurant = await Restaurant.findById(order.restaurantId).select("owner").lean();
      const allowed =
        String(order.userId) === String(socket.user.id) ||
        String(order.deliveryBoyId || "") === String(socket.user.id) ||
        String(restaurant?.owner || "") === String(socket.user.id) ||
        user?.role === "Admin";
      if (allowed) {
        socket.join(`order:${orderId}`);
      }
    });

    socket.on("tracking:leave", ({ orderId }) => {
      if (!orderId) return;
      socket.leave(`order:${orderId}`);
    });
  });

  return ioInstance;
};

export const getIO = () => ioInstance;
