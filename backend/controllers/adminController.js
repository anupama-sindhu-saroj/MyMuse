import Admin from "../models/Admin.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupAdmin = async (req, res) => {

  const { name, email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const admin = await Admin.create({
    name,
    email,
    password: hashed
  });

  res.json(admin);
};

export const loginAdmin = async (req, res) => {
    console.log("LOGIN API HIT");
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });

  if (!admin)
    return res.status(400).json({ message: "Admin not found" });

  const match = await bcrypt.compare(password, admin.password);

  if (!match)
    return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);

  res.json({ token, admin });
};