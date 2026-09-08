const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, trim: true }, // Địa chỉ nhận len
    role: {
      type: String,
      enum: [
        "Thợ gia công hoa len",
        "Thợ móc thú len",
        "Thợ ráp & hoàn thiện",
        "Thợ móc phụ kiện & túi",
        "Nhân viên kho & đóng gói",
        "Tư vấn & CSKH Zalo",
      ],
      default: "Thợ gia công hoa len",
    },
    // Bảng đơn giá công thợ theo công đoạn
    stageRates: {
      rawPartRate: { type: Number, default: 1000, min: 0 }, // Giá móc phôi / chi tiết (vd: 1.000đ/cái)
      assemblyRate: { type: Number, default: 2000, min: 0 }, // Giá móc ráp / hoàn thiện (vd: 2.000đ/sản phẩm)
      fullItemRate: { type: Number, default: 25000, min: 0 }, // Giá móc trọn gói (vd: 25.000đ/con)
    },
    pieceRate: { type: Number, default: 2000, min: 0 }, // Đơn giá mặc định
    completedCount: { type: Number, default: 0, min: 0 }, // Tổng số lượng sản phẩm đã hoàn thành
    pendingPayment: { type: Number, default: 0, min: 0 }, // Tiền công đang chờ thanh toán
    totalPaid: { type: Number, default: 0, min: 0 }, // Tổng tiền công đã thanh toán
    status: { type: String, enum: ["active", "pause"], default: "active" },
    skills: { type: String, trim: true }, // Tay nghề: Móc cánh tulip, ráp cành hoa, móc thú bông khó...
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Staff", staffSchema);
