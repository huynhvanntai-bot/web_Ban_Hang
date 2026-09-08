const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    address: { type: String, trim: true },
    supplyItems: { type: String, trim: true }, // Mặt hàng cung cấp: Len Milk Bò, Kim Móc, Bông hạt...
    rating: { type: Number, default: 5, min: 1, max: 5 },
    totalImported: { type: Number, default: 0, min: 0 }, // Tổng tiền đã nhập hàng
    importCount: { type: Number, default: 0, min: 0 }, // Số đợt đã nhập
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Supplier", supplierSchema);
