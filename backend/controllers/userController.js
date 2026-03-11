import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendOTP } from "../utils/sendEmail.js";
import validator from "validator";

export const signupUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;

    if (!validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });

    if (existing)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false
    });

    const user = await User.create({
      name,
      email,
      password: hashed,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000
    });

    await sendOTP(email, otp);

    res.json({
      message: "OTP sent to email",
      userId: user._id
    });

  } catch (error) {

    console.error("Signup error:", error);

    res.status(500).json({ message: error.message });

  }
};

export const verifyOTP = async (req, res) => {

  try {

    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    res.json({ message: "Email verified successfully" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const loginUser = async (req, res) => {

  try {

    console.log("LOGIN API HIT");

    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (!user.isVerified)
      return res.status(400).json({ message: "Please verify your email first" });

    const match = await bcrypt.compare(password, user.password);

    if (!match)
      return res.status(400).json({ message: "Wrong password" });

     const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // REFRESH TOKEN (long life)
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    const { password: _, ...safeUser } = user._doc;

    res.json({
  accessToken,
  refreshToken,
  user: safeUser
});

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};
export const forgotPassword = async (req, res) => {

  console.log("FORGOT PASSWORD API HIT");

  try {

    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false
    });

    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    await sendOTP(email, otp);

    res.json({ message: "Reset OTP sent to email" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }
};
export const verifyResetOTP = async (req, res) => {

  try {

    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (user.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.resetOTPExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

}; 
export const resetPassword = async (req, res) => {

  try {

    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    user.resetOTP = null;
    user.resetOTPExpiry = null;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};
export const getProfile = async (req, res) => {

  try {

    const user = await User.findById(req.user).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};