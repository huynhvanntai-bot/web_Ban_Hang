const mongoose = require("mongoose");

const importReceiptItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
  },
  productName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1 },
  costPrice: { type: Number, required: true, min: 0 }, // Giá nhập vốn
  total: { type: Number, required: true, min: 0 },
});

const importReceiptSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    }, // Mã phiếu e.g. PN-20260907-001
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    supplierName: { type: String, required: true, trim: true },
    supplierPhone: { type: String, trim: true },
    items: [importReceiptItemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled"],
      default: "completed",
    },
    importedBy: { type: String, default: "Admin Kho Len" },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ImportReceipt", importReceiptSchema);
