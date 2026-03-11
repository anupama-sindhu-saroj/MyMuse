import Museum from "../models/Museum.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const signupMuseum = async (req, res) => {

  const { museumName, email, phone, location, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const museum = await Museum.create({
    museumName,
    email,
    phone,
    location,
    password: hashed
  });

  res.json(museum);
};

export const loginMuseum = async (req, res) => {
    console.log("LOGIN API HIT");
  const { email, password } = req.body;

  const museum = await Museum.findOne({ email });

  if (!museum)
    return res.status(400).json({ message: "Museum not found" });

  const match = await bcrypt.compare(password, museum.password);

  if (!match)
    return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign({ id: museum._id }, process.env.JWT_SECRET);

  res.json({ token, museum });
};