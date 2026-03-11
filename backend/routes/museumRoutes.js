import express from "express";
import { signupMuseum, loginMuseum } from "../controllers/museumController.js";

const router = express.Router();

router.post("/signup", signupMuseum);
router.post("/login", loginMuseum);

export default router;