const mongoose = require("mongoose");

const artisanTaskSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    }, // Mã lệnh gia công e.g. GC-20260907-001
    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    staffName: { type: String, required: true, trim: true },
    staffPhone: { type: String, trim: true },
    taskName: { type: String, required: true, trim: true }, // vd: "Móc 1000 cánh hoa tulip đỏ", "Móc ráp 2000 bông tulip hoàn thiện"
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    productName: { type: String, required: true, trim: true },
    stage: {
      type: String,
      enum: ["raw_part", "assembly", "full_item"],
      default: "raw_part",
      // raw_part = Móc phôi / Chi tiết (vd: 1.000đ/cái)
      // assembly = Móc ráp hoàn thiện (vd: 2.000đ/sản phẩm)
      // full_item = Móc trọn gói A-Z (vd: 25.000đ/con)
    },
    materialsIssued: { type: String, trim: true }, // Nguyên liệu len & phụ kiện đã phát cho thợ
    quantityTarget: { type: Number, required: true, min: 1 }, // Số lượng giao
    unitRate: { type: Number, required: true, min: 0 }, // Đơn giá công thợ / 1 sản phẩm
    estimatedWages: { type: Number, required: true, min: 0 }, // Dự kiến tiền công
    quantityCompleted: { type: Number, default: 0, min: 0 }, // Số lượng đã nộp nghiệm thu đạt
    actualWages: { type: Number, default: 0, min: 0 }, // Tiền công thực tế
    status: {
      type: String,
      enum: [
        "assigned", // Mới giao việc & phát len
        "in_progress", // Thợ đang móc
        "submitted", // Thợ nộp sản phẩm chờ kiểm
        "inspected_passed", // Đã nghiệm thu (Tự động cộng kho nếu là ráp/trọn gói)
        "paid", // Đã thanh toán tiền công
        "cancelled", // Đã hủy
      ],
      default: "assigned",
    },
    autoStockAdded: { type: Boolean, default: false }, // Đã tự động cộng vào kho bán chưa
    addedStockQty: { type: Number, default: 0 }, // Số lượng đã cộng vào kho
    deadline: { type: String, trim: true },
    notes: { type: String, trim: true },
    inspectedAt: { type: Date },
    paidAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArtisanTask", artisanTaskSchema);
