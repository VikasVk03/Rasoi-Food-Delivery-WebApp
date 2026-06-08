import express from "express";
import http from "http";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import orderRouter from "./routes/order.routes.js";
import ownerRouter from "./routes/owner.routes.js";
import deliveryRouter from "./routes/delivery.routes.js";
import adminRouter from "./routes/admin.routes.js";
import cors from "cors";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";
import { errorMiddleware } from "./middlewares/error.js";
import { initializeSocket } from "./socket.js";

const app = express();
app.use(
	cors({
		origin: [process.env.FRONTEND_URL],
		methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
		credentials: true,
	}),
);

const port = process.env.PORT || 5000;
const server = http.createServer(app);

app.get("/", (req, res) => {
	res.send(`<p>Welcome to server</p>`);
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRouter);
app.use("/api/restaurants", restaurantRouter);
app.use("/api/orders", orderRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/delivery", deliveryRouter);
app.use("/api/admin", adminRouter);
app.use(errorMiddleware);

removeUnverifiedAccounts();

initializeSocket(server);

server.listen(port, () => {
	connectDB(); // database connection
	console.log(`Server running at ${port}`);
});
