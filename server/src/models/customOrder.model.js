const mongoose = require("mongoose");

const customOrderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    zalo: {
      type: String,
      trim: true,
    },
    productType: {
      type: String,
      default: "Hoa len handmade",
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    colorPreference: {
      type: String,
      trim: true,
      default: "",
    },
    desiredDate: {
      type: String,
      trim: true,
      default: "",
    },
    budget: {
      type: Number,
      default: 0,
    },
    quotedPrice: {
      type: Number,
      default: 0,
    },
    referenceImages: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["pending", "contacted", "in_progress", "completed", "cancelled"],
      default: "pending",
    },
    adminNotes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CustomOrder", customOrderSchema);
