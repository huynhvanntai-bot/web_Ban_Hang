const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const Promotion = require("../models/promotion.model");
const { protect, authorizeAdmin } = require("../middleware/auth.middleware");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
router.use(protect, authorizeAdmin);

router.post("/upload", upload.single("image"), async (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "Vui lòng chọn hình ảnh" });
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "tai-computer-shop/products", resource_type: "image" },
        (error, uploaded) => (error ? reject(error) : resolve(uploaded)),
      );
      stream.end(req.file.buffer);
    });
    res.json({ url: result.secure_url, publicId: result.public_id });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Upload Cloudinary thất bại", error: error.message });
  }
});

router.get("/dashboard", async (req, res) => {
  const [totalProducts, totalOrders, totalCustomers, revenueResult] =
    await Promise.all([
      Product.countDocuments({ isActive: true }),
      Order.countDocuments(),
      User.countDocuments({ role: "user" }),
      Order.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);
  res.json({
    totalProducts,
    totalOrders,
    totalCustomers,
    revenue: revenueResult[0]?.total || 0,
  });
});

router.get("/products", async (req, res) =>
  res.json(
    await Product.find({ isActive: true })
      .populate("category", "name slug")
      .sort({ createdAt: -1 }),
  ),
);
router.post("/products", async (req, res) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể thêm sản phẩm", error: error.message });
  }
});
router.put("/products/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "ID không hợp lệ" });
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!product)
    return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
  res.json(product);
});
router.delete("/products/:id", async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });
  res.json({ message: "Đã xóa sản phẩm" });
});

router.get("/categories", async (req, res) =>
  res.json(await Category.find().sort({ name: 1 })),
);
router.post("/categories", async (req, res) => {
  try {
    res.status(201).json(await Category.create(req.body));
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể thêm danh mục", error: error.message });
  }
});
router.put("/categories/:id", async (req, res) =>
  res.json(
    await Category.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    }),
  ),
);
router.delete("/categories/:id", async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa danh mục" });
});

router.get("/orders", async (req, res) =>
  res.json(
    await Order.find().populate("user", "name email").sort({ createdAt: -1 }),
  ),
);
router.get("/orders/:id", async (req, res) =>
  res.json(await Order.findById(req.params.id).populate("user", "name email")),
);
router.put("/orders/:id/status", async (req, res) => {
  const allowed = [
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ];
  if (!allowed.includes(req.body.status))
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  res.json(
    await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after" },
    ),
  );
});

router.get("/customers", async (req, res) => {
  const customers = await User.find({ role: "user" })
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();
  const stats = await Order.aggregate([
    { $match: { user: { $ne: null }, status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: "$user",
        orderCount: { $sum: 1 },
        totalSpent: { $sum: "$totalAmount" },
        lastOrderAt: { $max: "$createdAt" },
      },
    },
  ]);
  const statsMap = new Map(stats.map((item) => [String(item._id), item]));
  res.json(
    customers.map((customer) => ({
      ...customer,
      ...(statsMap.get(String(customer._id)) || {
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
      }),
    })),
  );
});

router.get("/reports", async (req, res) => {
  const [sales, dailyRevenue] = await Promise.all([
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { quantity: -1 } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: "cancelled" } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmount" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: 14 },
    ]),
  ]);
  res.json({
    bestSelling: sales.slice(0, 5),
    slowSelling: [...sales].sort((a, b) => a.quantity - b.quantity).slice(0, 5),
    dailyRevenue: dailyRevenue.reverse(),
  });
});

router.get("/promotions", async (req, res) =>
  res.json(await Promotion.find().sort({ createdAt: -1 })),
);
router.post("/promotions", async (req, res) => {
  try {
    res.status(201).json(await Promotion.create(req.body));
  } catch (error) {
    res
      .status(400)
      .json({ message: "Không thể tạo khuyến mãi", error: error.message });
  }
});
router.put("/promotions/:id", async (req, res) =>
  res.json(
    await Promotion.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    }),
  ),
);
router.delete("/promotions/:id", async (req, res) => {
  await Promotion.findByIdAndDelete(req.params.id);
  res.json({ message: "Đã xóa khuyến mãi" });
});

module.exports = router;
