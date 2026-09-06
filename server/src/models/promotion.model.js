const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    value: { type: Number, required: true, min: 0 },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    description: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Promotion", promotionSchema);
