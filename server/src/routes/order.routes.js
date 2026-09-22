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
      productId: item.product?._id || item.product,
      quantity: Math.max(1, Number.parseInt(item.quantity, 10) || 1),
      name: item.name || item.product?.name,
      price: item.price ?? item.product?.price,
      image: item.image || item.product?.images?.[0] || "",
    }));

    const validObjectIds = normalizedItems
      .map((item) => item.productId)
      .filter((id) => mongoose.isValidObjectId(id));

    const products = validObjectIds.length > 0
      ? await Product.find({ _id: { $in: validObjectIds } })
      : [];

    const productMap = new Map(
      products.map((product) => [product.id, product]),
    );

    const orderItems = [];
    let subtotalAmount = 0;

    for (const item of normalizedItems) {
      const product = productMap.get(String(item.productId));
      const finalName = product?.name || item.name || "Sản phẩm len handmade";
      const finalPrice = product ? product.price : (Number(item.price) || 0);
      const finalImage = product?.images?.[0] || item.image || "";

      subtotalAmount += finalPrice * item.quantity;
      orderItems.push({
        product: product ? product._id : item.productId,
        name: finalName,
        price: finalPrice,
        quantity: item.quantity,
        image: finalImage,
      });
    }

    let discountAmount = 0;
    let appliedPromotionCode;
    if (promoCode?.trim()) {
      const codeUpper = promoCode.trim().toUpperCase();
      const promotion = await Promotion.findOne({
        code: codeUpper,
        isActive: true,
        startAt: { $lte: new Date() },
        endAt: { $gte: new Date() },
      });
      if (promotion) {
        discountAmount =
          promotion.type === "percent"
            ? Math.round((subtotalAmount * promotion.value) / 100)
            : promotion.value;
        discountAmount = Math.min(discountAmount, subtotalAmount);
        appliedPromotionCode = promotion.code;
      } else if (codeUpper === "TIEMLEN10") {
        discountAmount = Math.round(subtotalAmount * 0.1);
        appliedPromotionCode = "TIEMLEN10";
      } else if (codeUpper === "FREESHIP") {
        discountAmount = Math.min(25000, subtotalAmount);
        appliedPromotionCode = "FREESHIP";
      } else if (codeUpper === "LENXINH30") {
        discountAmount = Math.min(30000, subtotalAmount);
        appliedPromotionCode = "LENXINH30";
      } else {
        return res
          .status(400)
          .json({ message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn" });
      }
    }

    const updatedProducts = [];
    for (const item of normalizedItems) {
      if (!mongoose.isValidObjectId(item.productId)) continue;
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { returnDocument: "after" },
      );
      if (updated) {
        updatedProducts.push({ id: updated._id, quantity: item.quantity });
      }
    }

    const trackingCode = `SPX-CT${Math.floor(100000 + Math.random() * 900000)}VN`;
    const initialLogs = [
      {
        time: new Date(),
        title: "Đã đặt hàng thành công",
        desc: `Đơn hàng #${trackingCode} đã được khởi tạo trên hệ thống Tiệm Len Cần Thơ.`,
        location: "Kho Tổng Cần Thơ (124 Đ. 30/4, Ninh Kiều)",
        icon: "📝",
      },
    ];

    if (paymentMethod === "BANK_TRANSFER") {
      initialLogs.push({
        time: new Date(),
        title: "Chờ thanh toán VietQR",
        desc: "Đang chờ tài khoản ngân hàng MB Bank 0942901124 ghi nhận tiền chuyển khoản.",
        location: "Hệ thống VietQR Napas 247",
        icon: "⏳",
      });
    } else {
      initialLogs.push({
        time: new Date(),
        title: "Thanh toán khi nhận hàng (COD)",
        desc: "Quý khách thanh toán tiền mặt cho bưu tá khi nhận và kiểm tra kiện len.",
        location: "Cần Thơ",
        icon: "💵",
      });
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
      paymentStatus: "unpaid",
      trackingCode,
      carrier: "Shopee Xpress (SPX Cần Thơ)",
      shipper: {
        name: "Nguyễn Văn Hùng",
        phone: "0918.234.567",
        vehicle: "Honda Wave Alpha (65-B1 839.21)",
        rating: 4.9,
      },
      shippingLogs: initialLogs,
    });
    res.status(201).json({ message: "Đặt hàng thành công", order });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể tạo đơn hàng", error: error.message });
  }
});

// KIỂM TRA TỰ ĐỘNG TIỀN ĐÃ QUA TÀI KHOẢN CHƯA (POLLING CHO CLIENT)
router.get("/:id/check-payment", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
    res.json({
      isPaid: order.paymentStatus === "paid",
      paymentStatus: order.paymentStatus,
      status: order.status,
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi kiểm tra thanh toán", error: error.message });
  }
});

// GIẢ LẬP / WEBHOOK XÁC NHẬN CHUYỂN KHOẢN THÀNH CÔNG (TỰ ĐỘNG BẬT MÀU XANH & DUYỆT ĐƠN)
router.post("/:id/simulate-payment", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    order.paymentStatus = "paid";
    order.paidAt = new Date();
    if (order.status === "pending") {
      order.status = "confirmed";
    }

    const newLogs = [
      {
        time: new Date(),
        title: "Tài khoản nhận tiền thành công",
        desc: `Tài khoản MB Bank 0942901124 (HUYNH VAN TAI) đã nhận số tiền ${(order.totalAmount || 0).toLocaleString("vi-VN")}đ qua VietQR.`,
        location: "MB Bank CN Cần Thơ",
        icon: "💳",
      },
      {
        time: new Date(Date.now() + 1000),
        title: "Shop đã duyệt & chuẩn bị hàng",
        desc: "Tiệm Len Cần Thơ đã xác nhận thanh toán và đang đóng gói sản phẩm len handmade.",
        location: "Kho Tổng Cần Thơ (Xuân Khánh, Ninh Kiều)",
        icon: "🏪",
      },
    ];

    order.shippingLogs = [...(order.shippingLogs || []), ...newLogs];
    await order.save();

    res.json({
      success: true,
      message: "Chuyển khoản thành công! Tiền đã vào tài khoản MB Bank.",
      order,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật thanh toán", error: error.message });
  }
});

// CẬP NHẬT TRẠNG THÁI VẬN CHUYỂN (TIẾN TRÌNH SHOPEE EXPRESS)
router.post("/:id/advance-shipping", async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    const targetStatus = req.body.status;
    let nextStatus = targetStatus;

    if (!nextStatus) {
      if (order.status === "pending") nextStatus = "confirmed";
      else if (order.status === "confirmed") nextStatus = "shipping";
      else if (order.status === "shipping") nextStatus = "delivered";
      else nextStatus = "delivered";
    }

    order.status = nextStatus;
    const now = new Date();

    if (nextStatus === "confirmed") {
      order.shippingLogs.push({
        time: now,
        title: "Shop đã xác nhận & Đóng gói",
        desc: "Đơn hàng len handmade đã được đóng gói 3 lớp chống sốc và dán mã vận đơn SPX.",
        location: "Kho Tổng Cần Thơ (124 Đ. 30/4, Ninh Kiều)",
        icon: "📦",
      });
    } else if (nextStatus === "shipping") {
      order.shippingLogs.push({
        time: now,
        title: "Bưu tá Shopee Xpress đang giao",
        desc: `Bưu tá ${order.shipper?.name || "Nguyễn Văn Hùng"} (${order.shipper?.phone || "0918.234.567"}) đang di chuyển giao kiện hàng đến bạn. Vui lòng chú ý điện thoại.`,
        location: "Đang trên tuyến đường giao hàng Cần Thơ",
        icon: "🚚",
      });
    } else if (nextStatus === "delivered") {
      order.paymentStatus = "paid";
      order.shippingLogs.push({
        time: now,
        title: "Giao hàng thành công",
        desc: "Kiện hàng len xinh đã được giao thành công đến quý khách. Cảm ơn bạn đã ủng hộ Tiệm Len Cần Thơ!",
        location: order.address || "Địa chỉ nhận hàng",
        icon: "🎉",
      });
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật tiến độ vận chuyển", error: error.message });
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
      return res.status(400).json({ message: "Vui lòng nhập mã đơn, mã vận đơn hoặc số điện thoại" });
    }

    const query = [
      { phone: rawLookup },
      { trackingCode: { $regex: new RegExp(rawLookup, "i") } },
    ];
    if (mongoose.isValidObjectId(rawLookup)) {
      query.push({ _id: rawLookup });
    }

    let orders = await Order.find({ $or: query }).sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      const allRecent = await Order.find().sort({ createdAt: -1 }).limit(100);
      orders = allRecent.filter((o) => {
        const idStr = o._id.toString();
        const code = o.trackingCode || "";
        return (
          idStr.toLowerCase().endsWith(rawLookup.toLowerCase()) ||
          code.toLowerCase().includes(rawLookup.toLowerCase()) ||
          o.phone.includes(rawLookup)
        );
      });
    }

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng phù hợp" });
    }

    // Đảm bảo đơn hàng cũ cũng có thông tin tracking và logs chuẩn
    orders = orders.map((o) => {
      const obj = o.toObject ? o.toObject() : o;
      if (!obj.trackingCode) {
        obj.trackingCode = `SPX-CT${obj._id.toString().slice(-6).toUpperCase()}VN`;
      }
      if (!obj.carrier) {
        obj.carrier = "Shopee Xpress (SPX Cần Thơ)";
      }
      if (!obj.shipper) {
        obj.shipper = {
          name: "Nguyễn Văn Hùng",
          phone: "0918.234.567",
          vehicle: "Honda Wave Alpha (65-B1 839.21)",
          rating: 4.9,
        };
      }
      if (!obj.shippingLogs || obj.shippingLogs.length === 0) {
        obj.shippingLogs = [
          {
            time: obj.createdAt || new Date(),
            title: "Đã đặt hàng thành công",
            desc: `Đơn hàng #${obj.trackingCode} đã tiếp nhận trên hệ thống Tiệm Len Cần Thơ.`,
            location: "Kho Tổng Cần Thơ (124 Đ. 30/4, Ninh Kiều)",
            icon: "📝",
          },
          ...(obj.status === "confirmed" || obj.status === "shipping" || obj.status === "delivered"
            ? [
                {
                  time: new Date(new Date(obj.createdAt || Date.now()).getTime() + 15 * 60000),
                  title: "Shop đã duyệt & Đóng gói",
                  desc: "Kiện len handmade đã đóng gói xong và bàn giao cho bưu tá Shopee Xpress.",
                  location: "Kho Tổng Cần Thơ",
                  icon: "🏪",
                },
              ]
            : []),
          ...(obj.status === "shipping" || obj.status === "delivered"
            ? [
                {
                  time: new Date(new Date(obj.createdAt || Date.now()).getTime() + 45 * 60000),
                  title: "Bưu tá đang phát hàng",
                  desc: "Bưu tá Nguyễn Văn Hùng (0918.234.567) đang trên đường giao đơn hàng đến bạn.",
                  location: "Tuyến phát Ninh Kiều - Cần Thơ",
                  icon: "🚚",
                },
              ]
            : []),
          ...(obj.status === "delivered"
            ? [
                {
                  time: new Date(new Date(obj.createdAt || Date.now()).getTime() + 90 * 60000),
                  title: "Giao hàng thành công",
                  desc: "Khách hàng đã nhận kiện hàng len xinh và hoàn tất đơn hàng.",
                  location: obj.address || "Cần Thơ",
                  icon: "🎉",
                },
              ]
            : []),
        ];
      }
      return obj;
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi tra cứu đơn hàng", error: error.message });
  }
});

module.exports = router;
