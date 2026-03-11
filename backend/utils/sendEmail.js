import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});

export const sendOTP = async (email, otp) => {
  try {

    console.log("Sending OTP to:", email);
    console.log("OTP:", otp);

    const info = await transporter.sendMail({
      from: `"Museum Portal" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your verification OTP is ${otp}`
    });

    console.log("Email sent:", info.response);

  } catch (error) {

    console.error("Email error:", error);

    throw error;

  }
};