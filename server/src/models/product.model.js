const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    price: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 }, // Giá vốn nhập len hoặc công thợ
    productType: {
      type: String,
      enum: ["yarn_retail", "self_made", "outsourced"],
      default: "yarn_retail", // yarn_retail = Nhập len bán lẻ, self_made = Shop tự móc, outsourced = Nhờ thợ gia công
    },
    supplier: { type: String, trim: true },
    artisan: { type: String, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    images: [{ type: String, trim: true }],
    description: { type: String, trim: true },
    brand: { type: String, trim: true },
    featured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Product", productSchema);
