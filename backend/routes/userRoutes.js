import express from "express";
import { signupUser, loginUser, verifyOTP,forgotPassword, verifyResetOTP, resetPassword,getProfile } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signupUser);
router.post("/verify-otp", verifyOTP);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);
router.get("/profile", protect, getProfile);

export default router;