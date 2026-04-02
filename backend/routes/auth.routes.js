import express from "express";
import { forgotPassword, getUser, login, logout, resetPassword, signup, verifyOTP } from "../controllers/auth.controls.js";
import { isAuthenticated } from "../middlewares/AuthValidation.js";

const authRouter = express.Router();

authRouter.post("/signup", signup)
authRouter.post("/otp-verification", verifyOTP)
authRouter.post("/login", login)
authRouter.get("/logout", isAuthenticated, logout)
authRouter.get("/user", isAuthenticated, getUser);
authRouter.post("/password/forgot", forgotPassword);
authRouter.put("/password/reset/:token", resetPassword)

export default authRouter;
