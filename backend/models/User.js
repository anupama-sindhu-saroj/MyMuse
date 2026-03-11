import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,

  email: {
    type: String,
  required: true,
  unique: true,
  lowercase: true,
  match: [/^\S+@\S+\.\S+$/, "Please use a valid email"]
  },

  password: String,

  isVerified: {
    type: Boolean,
    default: false
  },

  otp: String,
  otpExpiry: Date,
  resetOTP: String,
  resetOTPExpiry: Date
});

export default mongoose.model("User", userSchema);