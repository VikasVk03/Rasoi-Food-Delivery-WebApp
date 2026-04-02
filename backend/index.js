import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import cors from "cors";
import { removeUnverifiedAccounts } from "./automation/removeUnverifiedAccounts.js";

const app = express();
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send(`<p>Welcome to server</p>`);
});

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))
app.use("/api/auth", authRouter);

removeUnverifiedAccounts()

app.listen(port, () => {
  connectDB();  // database connection
  console.log(`Server running at ${port}`);
});
