const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Order = require("../models/order.model");
const Promotion = require("../models/promotion.model");
const { protect, optionalProtect } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", optionalProtect, async (req, res) => {
  const {
    customerName,
    phone,
    address,
    note,
    paymentMethod = "COD",
    promoCode,
    items,
  } = req.body;
  if (
    !customerName ||
    !phone ||
    !address ||
    !Array.isArray(items) ||
    items.length === 0
  ) {
    return res
      .status(400)
      .json({ message: "Vui lòng nhập thông tin giao hàng và sản phẩm" });
  }

  try {
    if (!["COD", "BANK_TRANSFER", "ONLINE"].includes(paymentMethod))
      return res
        .status(400)
        .json({ message: "Phương thức thanh toán không hợp lệ" });
    const normalizedItems = items.map((item) => ({
      productId: item.product,
      quantity: Number.parseInt(item.quantity, 10),
    }));
    if (
      normalizedItems.some(
        (item) =>
          !mongoose.isValidObjectId(item.productId) ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1,
      )
    )
      return res
        .status(400)
        .json({ message: "Sản phẩm hoặc số lượng không hợp lệ" });

    const products = await Product.find({
      _id: { $in: normalizedItems.map((item) => item.productId) },
      isActive: true,
    });
    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );
    const orderItems = [];
    let subtotalAmount = 0;
    for (const item of normalizedItems) {
      const product = productMap.get(String(item.productId));
      if (!product)
        return res
          .status(404)
          .json({ message: "Một sản phẩm không còn tồn tại" });
      if (product.stock < item.quantity)
        return res
          .status(400)
          .json({ message: `${product.name} không đủ tồn kho` });
      subtotalAmount += product.price * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images?.[0],
      });
    }

    let discountAmount = 0;
    let appliedPromotionCode;
    if (promoCode?.trim()) {
      const promotion = await Promotion.findOne({
        code: promoCode.trim().toUpperCase(),
        isActive: true,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
      });
      if (!promotion)
        return res
          .status(400)
          .json({ message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn" });
      discountAmount =
        promotion.type === "percent"
          ? Math.round((subtotalAmount * promotion.value) / 100)
          : promotion.value;
      discountAmount = Math.min(discountAmount, subtotalAmount);
      appliedPromotionCode = promotion.code;
    }

    const updatedProducts = [];
    for (const item of normalizedItems) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { returnDocument: "after" },
      );
      if (!updated) {
        for (const previous of updatedProducts)
          await Product.findByIdAndUpdate(previous.id, {
            $inc: { stock: previous.quantity },
          });
        return res
          .status(409)
          .json({ message: "Tồn kho vừa thay đổi, vui lòng thử lại" });
      }
      updatedProducts.push({ id: updated._id, quantity: item.quantity });
    }

    const order = await Order.create({
      user: req.user?._id,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      note: note?.trim(),
      items: orderItems,
      subtotalAmount,
      discountAmount,
      promotionCode: appliedPromotionCode,
      totalAmount: subtotalAmount - discountAmount,
      paymentMethod,
    });
    res.status(201).json({ message: "Đặt hàng thành công", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể tạo đơn hàng", error: error.message });
  }
});

router.get("/mine", protect, async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(orders);
});

router.get("/track/:lookup", async (req, res) => {
  try {
    const rawLookup = (req.params.lookup || "").trim();
    if (!rawLookup) {
      return res.status(400).json({ message: "Vui lòng nhập mã đơn hoặc số điện thoại" });
    }

    const query = [{ phone: rawLookup }];
    if (mongoose.isValidObjectId(rawLookup)) {
      query.push({ _id: rawLookup });
    }

    let orders = await Order.find({ $or: query }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      const allRecent = await Order.find().sort({ createdAt: -1 }).limit(100);
      orders = allRecent.filter((o) => {
        const idStr = o._id.toString();
        return (
          idStr.toLowerCase().endsWith(rawLookup.toLowerCase()) ||
          o.phone.includes(rawLookup)
        );
      });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng phù hợp" });
    }

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tra cứu đơn hàng", error: error.message });
  }
});

module.exports = router;
