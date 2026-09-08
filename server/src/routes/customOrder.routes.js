const express = require("express");
const mongoose = require("mongoose");
const CustomOrder = require("../models/customOrder.model");

const router = express.Router();

// Tạo đơn đặt móc len theo mẫu riêng (Public cho khách gửi)
router.post("/", async (req, res) => {
  try {
    const {
      customerName,
      phone,
      zalo,
      productType,
      description,
      colorPreference,
      desiredDate,
      budget,
      referenceImages,
    } = req.body;

    if (!customerName || !phone || !description) {
      return res.status(400).json({
        message: "Vui lòng nhập họ tên, số điện thoại và mô tả yêu cầu mẫu",
      });
    }

    const newOrder = await CustomOrder.create({
      customerName: customerName.trim(),
      phone: phone.trim(),
      zalo: (zalo || phone).trim(),
      productType: productType || "Hoa len handmade",
      description: description.trim(),
      colorPreference: (colorPreference || "").trim(),
      desiredDate: (desiredDate || "").trim(),
      budget: Number(budget) || 0,
      referenceImages: Array.isArray(referenceImages) ? referenceImages : [],
      status: "pending",
    });

    res.status(201).json({
      message: "🎉 Gửi yêu cầu đặt móc thành công! Tiệm Sene Handmade sẽ liên hệ Zalo sớm nhất.",
      order: newOrder,
    });
  } catch (error) {
    res.status(500).json({
      message: "Không thể tạo đơn đặt móc riêng",
      error: error.message,
    });
  }
});

// Lấy danh sách đơn đặt riêng (Admin)
router.get("/", async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;
    if (search) {
      filter.$or = [
        { customerName: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
        { description: new RegExp(search, "i") },
      ];
    }

    const orders = await CustomOrder.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tải danh sách đơn đặt móc riêng",
      error: error.message,
    });
  }
});

// Cập nhật trạng thái / báo giá / ghi chú đơn đặt riêng (Admin)
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }

    const { status, quotedPrice, adminNotes } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (quotedPrice !== undefined) updateData.quotedPrice = Number(quotedPrice);
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const updated = await CustomOrder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Không tìm thấy đơn đặt riêng" });
    }

    res.json({
      message: "Đã cập nhật đơn đặt móc riêng",
      order: updated,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi cập nhật đơn đặt riêng",
      error: error.message,
    });
  }
});

// Xóa đơn đặt riêng
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID không hợp lệ" });
    }
    await CustomOrder.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa đơn đặt móc riêng" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi xóa đơn đặt riêng",
      error: error.message,
    });
  }
});

module.exports = router;
