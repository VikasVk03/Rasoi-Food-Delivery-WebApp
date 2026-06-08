import express from "express";
import { getAdminDashboard } from "../controllers/admin.controls.js";
import { authorizeRoles, isAuthenticated } from "../middlewares/AuthValidation.js";

const adminRouter = express.Router();

adminRouter.use(isAuthenticated, authorizeRoles("Admin"));
adminRouter.get("/dashboard", getAdminDashboard);

export default adminRouter;
