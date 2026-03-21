import Museum from "../models/Museum.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import { sendOTP } from "../utils/sendEmail.js";

export const signupMuseum = async (req, res) => {

  try {

    const { museumName, email, phone, location, password } = req.body;

    const existing = await Museum.findOne({ email });

    if (existing)
      return res.status(400).json({ message: "Museum already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false,
      upperCase: false,
      specialChars: false
    });

    const museum = await Museum.create({
      museumName,
      email,
      phone,
      location,
      password: hashed,
      otp,
      otpExpiry: Date.now() + 5 * 60 * 1000
    });

    await sendOTP(email, otp);

    res.json({
      message: "OTP sent",
      museumId: museum._id
    });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const verifyMuseumOTP = async (req, res) => {

  try {

    const { museumId, otp } = req.body;

    const museum = await Museum.findById(museumId);

    if (!museum)
      return res.status(404).json({ message: "Museum not found" });

    if (museum.otp !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (museum.otpExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    museum.isVerified = true;
    museum.otp = null;
    museum.otpExpiry = null;

    await museum.save();

    res.json({ message: "Museum verified successfully" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const loginMuseum = async (req, res) => {

  try {

    const { email, password } = req.body;

    const museum = await Museum.findOne({ email });

    if (!museum)
      return res.status(400).json({ message: "Museum not found" });

    if (!museum.isVerified)
      return res.status(400).json({ message: "Verify email first" });

    const match = await bcrypt.compare(password, museum.password);

    if (!match)
      return res.status(400).json({ message: "Invalid password" });

    const accessToken = jwt.sign(
      { id: museum._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: museum._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ accessToken, refreshToken, museum });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const forgotMuseumPassword = async (req, res) => {

  try {

    const { email } = req.body;

    const museum = await Museum.findOne({ email });

    if (!museum)
      return res.status(404).json({ message: "Museum not found" });

    const otp = otpGenerator.generate(6, {
      digits: true,
      alphabets: false
    });

    museum.resetOTP = otp;
    museum.resetOTPExpiry = Date.now() + 5 * 60 * 1000;

    await museum.save();

    await sendOTP(email, otp);

    res.json({ message: "Reset OTP sent" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const verifyMuseumResetOTP = async (req, res) => {

  try {

    const { email, otp } = req.body;

    const museum = await Museum.findOne({ email });

    if (!museum)
      return res.status(404).json({ message: "Museum not found" });

    if (museum.resetOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (museum.resetOTPExpiry < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    res.json({ message: "OTP verified" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};

export const resetMuseumPassword = async (req, res) => {

  try {

    const { email, newPassword } = req.body;

    const museum = await Museum.findOne({ email });

    if (!museum)
      return res.status(404).json({ message: "Museum not found" });

    const hashed = await bcrypt.hash(newPassword, 10);

    museum.password = hashed;
    museum.resetOTP = null;
    museum.resetOTPExpiry = null;

    await museum.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {

    res.status(500).json({ message: error.message });

  }

};