const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.Mixed,
      ref: "Product",
    },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    image: { type: String },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    customerName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: (items) => items.length > 0,
    },
    totalAmount: { type: Number, required: true, min: 0 },
    subtotalAmount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    promotionCode: { type: String, trim: true, uppercase: true },
    paymentMethod: {
      type: String,
      enum: ["COD", "BANK_TRANSFER", "ONLINE"],
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    paidAt: { type: Date },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    trackingCode: { type: String, trim: true },
    carrier: { type: String, default: "Shopee Xpress (SPX Cần Thơ)" },
    shipper: {
      name: { type: String, default: "Nguyễn Văn Hùng" },
      phone: { type: String, default: "0918.234.567" },
      vehicle: { type: String, default: "Honda Wave Alpha (65-B1 839.21)" },
      rating: { type: Number, default: 4.9 },
    },
    shippingLogs: [
      {
        time: { type: Date, default: Date.now },
        title: { type: String },
        desc: { type: String },
        location: { type: String },
        icon: { type: String, default: "📦" },
      },
    ],
    note: { type: String, trim: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Order", orderSchema);
