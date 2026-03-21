import express from "express";

import {
 signupMuseum,
 loginMuseum,
 verifyMuseumOTP,
 forgotMuseumPassword,
 verifyMuseumResetOTP,
 resetMuseumPassword
} from "../controllers/museumController.js";

const router = express.Router();

router.post("/signup", signupMuseum);
router.post("/verify-otp", verifyMuseumOTP);
router.post("/login", loginMuseum);

router.post("/forgot-password", forgotMuseumPassword);
router.post("/verify-reset-otp", verifyMuseumResetOTP);
router.post("/reset-password", resetMuseumPassword);

export default router;