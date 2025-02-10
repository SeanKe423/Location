const mongoose = require("mongoose");

const CounselorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  specialization: { type: String }, // e.g., Anxiety, Depression, Family Counseling
  experience: { type: Number }, // Years of experience
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Counselor", CounselorSchema);
