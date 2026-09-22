const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["user", "admin", "superadmin", "staff"],
      default: "user",
    },
    isActive: { type: Boolean, default: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
