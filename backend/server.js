import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";

import userRoutes from "./routes/userRoutes.js";
import museumRoutes from "./routes/museumRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import rateLimit from "express-rate-limit";

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: "Too many OTP requests. Try again later."
});



const app = express();

connectDB();



app.use(cors());
app.use(express.json());
app.use("/api/users/signup", otpLimiter);
app.use("/api/users", userRoutes);
app.use("/api/museums", museumRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users/login", rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
}));

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});
