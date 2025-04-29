import express from "express";
import { getProfileById, updateProfile } from "../controllers/profile.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

// Protected routes - authentication required
router.use(verifyToken); // Apply verifyToken middleware to all routes below
router.get("/", getProfileById);
router.put("/update-profile", updateProfile); // handleAvatarUpload middleware for avatar upload

export default router;