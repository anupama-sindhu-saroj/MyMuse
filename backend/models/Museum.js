import mongoose from "mongoose";

const museumSchema = new mongoose.Schema({
  museumName: String,
  email: { type: String, unique: true },
  phone: String,
  location: String,
  password: String
});

export default mongoose.model("Museum", museumSchema);