import mongoose from "mongoose";

const museumSchema = new mongoose.Schema({
  museumName: String,

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  phone: String,
  location: String,

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

export default mongoose.model("Museum", museumSchema);