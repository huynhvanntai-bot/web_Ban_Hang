const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Order = require("../models/order.model");
const User = require("../models/user.model");
const Promotion = require("../models/promotion.model");
const Supplier = require("../models/supplier.model");
const Staff = require("../models/staff.model");
const ImportReceipt = require("../models/importReceipt.model");
const ArtisanTask = require("../models/artisanTask.model");
const { protect, authorizeAdmin } = require("../middleware/auth.middleware");
const cloudinary = require("../config/cloudinary");
const multer = require("multer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Seed sample data for Suppliers and Staff if empty
async function ensureSeedData() {
  try {
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      console.log("Seeding initial suppliers...");
      await Supplier.create([
        {
          name: "Tổng Kho Sợi Milk Cotton Miền Nam",
          contactPerson: "Chị Hạnh (Phụ trách sỉ)",
          phone: "0908 123 456",
          email: "khosoi.mientrung@gmail.com",
          address: "Tân Bình, TP. Hồ Chí Minh",
          supplyItems: "Len Milk Bò 50g, Len Milk Cotton 125g, Len Nhung Đũa",
          rating: 5,
          totalImported: 18500000,
          importCount: 6,
          notes: "Giao hàng hỏa tốc trong ngày, giá sỉ tốt từ 50 cuộn.",
          isActive: true,
        },
        {
          name: "Xưởng Phụ Kiện Kim Móc Kim Long",
          contactPerson: "Anh Long",
          phone: "0912 345 678",
          email: "kimlong.craft@gmail.com",
          address: "Hoàn Kiếm, Hà Nội",
          supplyItems: "Kim móc Tulip Nhật, kim SKC, mắt thú chốt an toàn, bông gòn bi",
          rating: 5,
          totalImported: 9200000,
          importCount: 4,
          notes: "Nguồn kim chuẩn chính hãng, bông bi trắng loại 1 không xẹp.",
          isActive: true,
        },
        {
          name: "Đại Lý Len Sợi Nhập Khẩu Sài Gòn",
          contactPerson: "Cô Lan",
          phone: "0933 888 999",
          email: "lennhapkhau.sg@gmail.com",
          address: "Quận 5, TP. Hồ Chí Minh",
          supplyItems: "Len Chenille, Sợi Dệt, Sợi Cúc Tần, Len Lông Cừu",
          rating: 4,
          totalImported: 12400000,
          importCount: 5,
          notes: "Màu sắc phong phú, hàng về theo đợt mỗi tháng.",
          isActive: true,
        },
      ]);
    }

    const staffCount = await Staff.countDocuments();
    if (staffCount === 0) {
      console.log("Seeding initial staff...");
      const staffMembers = await Staff.create([
        {
          name: "Chị Mai (Thợ Móc Hoa Thủ Công)",
          phone: "0987 111 222",
          address: "Quận Bình Thạnh, TP.HCM",
          role: "Thợ gia công hoa len",
          stageRates: {
            rawPartRate: 1000, // 1.000đ móc cánh hoa / chi tiết
            assemblyRate: 2000, // 2.000đ ráp hoàn thiện cành hoa
            fullItemRate: 20000, // 20.000đ trọn gói bó hoa
          },
          pieceRate: 2000,
          completedCount: 650,
          pendingPayment: 400000,
          totalPaid: 1300000,
          skills: "Hoa tulip, hoa hướng dương, hoa hồng gói giấy Hàn Quốc",
          status: "active",
          notes: "Mũi móc đều đẹp, đúng tiến độ giao hàng trước các dịp lễ.",
        },
        {
          name: "Em Linh (Thợ Móc Thú Bông Amigurumi)",
          phone: "0976 333 444",
          address: "Quận Gò Vấp, TP.HCM",
          role: "Thợ móc thú len",
          stageRates: {
            rawPartRate: 5000, // 5.000đ móc chi tiết tai, tay, chân
            assemblyRate: 10000, // 10.000đ khâu ráp, nhồi bông và hoàn thiện
            fullItemRate: 45000, // 45.000đ trọn gói bé gấu
          },
          pieceRate: 45000,
          completedCount: 88,
          pendingPayment: 600000,
          totalPaid: 1710000,
          skills: "Thỏ tai dài, gấu dâu Lotso, móc khóa capybara",
          status: "active",
          notes: "Khâu ráp mắt mũi rất có hồn, sản phẩm tinh xảo.",
        },
        {
          name: "Ngọc Trâm (Nhân Viên Đóng Gói & Kho)",
          phone: "0965 555 666",
          address: "Kho chính Quận 10",
          role: "Nhân viên kho & đóng gói",
          stageRates: {
            rawPartRate: 1000,
            assemblyRate: 3000,
            fullItemRate: 5000,
          },
          pieceRate: 5000,
          completedCount: 120,
          pendingPayment: 150000,
          totalPaid: 600000,
          skills: "Đóng gói hộp quà, thắt nơ ruy băng, dán tem nhãn shop",
          status: "active",
          notes: "Làm việc cẩn thận, không bị sót đơn.",
        },
      ]);

      const tulipProduct = await Product.findOne({
        name: { $regex: /tulip|hoa/i },
      });
      await ArtisanTask.create([
        {
          code: "GC-1001",
          staff: staffMembers[0]._id,
          staffName: staffMembers[0].name,
          staffPhone: staffMembers[0].phone,
          taskName: "Móc 1000 cánh hoa tulip đỏ",
          product: tulipProduct?._id,
          productName: tulipProduct?.name || "Bó Hoa Tulip Len Vĩnh Cửu",
          stage: "raw_part",
          materialsIssued: "4 cuộn Len Milk Bò đỏ #08, 1 cuộn xanh lá",
          quantityTarget: 1000,
          unitRate: 1000,
          estimatedWages: 1000000,
          quantityCompleted: 1000,
          actualWages: 1000000,
          status: "paid",
          autoStockAdded: false,
          notes: "Thợ đã nộp đủ 1000 cánh hoa phôi, mũi đều.",
          paidAt: new Date(),
        },
        {
          code: "GC-1002",
          staff: staffMembers[0]._id,
          staffName: staffMembers[0].name,
          staffPhone: staffMembers[0].phone,
          taskName: "Móc ráp 200 cành hoa tulip hoàn thiện",
          product: tulipProduct?._id,
          productName: tulipProduct?.name || "Bó Hoa Tulip Len Vĩnh Cửu",
          stage: "assembly",
          materialsIssued: "1000 cánh hoa phôi, 200 que cành kẽm, băng keo sáp",
          quantityTarget: 200,
          unitRate: 2000,
          estimatedWages: 400000,
          quantityCompleted: 200,
          actualWages: 400000,
          status: "inspected_passed",
          autoStockAdded: true,
          addedStockQty: 200,
          notes: "Đã nghiệm thu cành cứng cáp, quấn sáp đẹp, đã cộng 200 cành vào kho.",
        },
      ]);
    }
  } catch (err) {
    console.error("Seed data check error:", err.message);
  }
}

// Run initial seed once DB is connected
if (mongoose.connection.readyState === 1) {
  ensureSeedData();
} else {
  mongoose.connection.once("open", () => {
    ensureSeedData();
  });
}

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

// DASHBOARD
router.get("/dashboard", async (req, res) => {
  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    revenueResult,
    totalSuppliers,
    totalStaff,
    lowStockCount,
    totalImports,
    totalTasks,
    activeTasksCount,
  ] = await Promise.all([
    Product.countDocuments({ isActive: true }),
    Order.countDocuments(),
    User.countDocuments({ role: "user" }),
    Order.aggregate([
      { $match: { status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Supplier.countDocuments({ isActive: true }).catch(() => 0),
    Staff.countDocuments({ status: "active" }).catch(() => 0),
    Product.countDocuments({ isActive: true, stock: { $lt: 10 } }),
    ImportReceipt.countDocuments().catch(() => 0),
    ArtisanTask.countDocuments().catch(() => 0),
    ArtisanTask.countDocuments({
      status: { $in: ["assigned", "in_progress", "submitted"] },
    }).catch(() => 0),
  ]);
  res.json({
    totalProducts,
    totalOrders,
    totalCustomers,
    revenue: revenueResult[0]?.total || 0,
    totalSuppliers,
    totalStaff,
    lowStockCount,
    totalImports,
    totalTasks,
    activeTasksCount,
  });
});

// PRODUCTS
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

// CATEGORIES
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

// ORDERS
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

// CUSTOMERS
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

// RESET PASSWORD
router.put("/customers/:id/reset-password", async (req, res) => {
  try {
    const { newPassword } = req.body;
    const passwordToSet =
      (newPassword && newPassword.trim()) ||
      "LenXinh@" + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(passwordToSet, 10);
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { password: hashedPassword },
      { returnDocument: "after" },
    );
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy khách hàng" });
    res.json({
      message: "Đặt lại mật khẩu thành công",
      newPassword: passwordToSet,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi đặt lại mật khẩu", error: err.message });
  }
});

// REPORTS
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

// PROMOTIONS
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

// ==========================================
// 🏢 QUẢN LÝ NHÀ CUNG CẤP (SUPPLIERS)
// ==========================================
router.get("/suppliers", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query = {
        $or: [
          { name: regex },
          { phone: regex },
          { contactPerson: regex },
          { supplyItems: regex },
          { address: regex },
        ],
      };
    }
    const suppliers = await Supplier.find(query).sort({ createdAt: -1 });
    res.json(suppliers);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi tải nhà cung cấp", error: err.message });
  }
});

router.post("/suppliers", async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể thêm nhà cung cấp", error: err.message });
  }
});

router.put("/suppliers/:id", async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!supplier)
      return res.status(404).json({ message: "Không tìm thấy nhà cung cấp" });
    res.json(supplier);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể cập nhật nhà cung cấp", error: err.message });
  }
});

router.delete("/suppliers/:id", async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa nhà cung cấp thành công" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi xóa nhà cung cấp", error: err.message });
  }
});

// ==========================================
// 📦 QUẢN LÝ NHẬP HÀNG (IMPORT RECEIPTS)
// TỰ ĐỘNG CẬP NHẬT KHO & TỔNG TIỀN NCC
// ==========================================
router.get("/imports", async (req, res) => {
  try {
    const imports = await ImportReceipt.find()
      .populate("supplier", "name phone address")
      .sort({ createdAt: -1 });
    res.json(imports);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi tải lịch sử nhập hàng", error: err.message });
  }
});

router.post("/imports", async (req, res) => {
  try {
    const {
      code,
      supplierId,
      supplierName,
      supplierPhone,
      items,
      notes,
      importedBy,
    } = req.body;

    if (!items || !items.length) {
      return res
        .status(400)
        .json({ message: "Vui lòng chọn ít nhất 1 mặt hàng len cần nhập" });
    }

    const calculatedTotal = items.reduce(
      (sum, item) => sum + Number(item.quantity || 0) * Number(item.costPrice || 0),
      0,
    );

    const receiptCode =
      (code && code.trim()) || `PN-${Date.now().toString().slice(-6)}`;

    // 1. Tạo bản ghi Phiếu Nhập
    const receipt = await ImportReceipt.create({
      code: receiptCode,
      supplier: mongoose.isValidObjectId(supplierId) ? supplierId : undefined,
      supplierName: supplierName || "Nhà Cung Cấp Tổng Hợp",
      supplierPhone: supplierPhone || "",
      items: items.map((it) => ({
        product: mongoose.isValidObjectId(it.productId) ? it.productId : undefined,
        productName: it.productName,
        quantity: Number(it.quantity),
        costPrice: Number(it.costPrice),
        total: Number(it.quantity) * Number(it.costPrice),
      })),
      totalAmount: calculatedTotal,
      status: "completed",
      importedBy: importedBy || "Admin Kho Len",
      notes: notes || "",
    });

    // 2. TỰ ĐỘNG CẬP NHẬT TỒN KHO & GIÁ VỐN CHO TỪNG SẢN PHẨM
    for (const item of items) {
      const quantityToAdd = Number(item.quantity) || 0;
      const unitCost = Number(item.costPrice) || 0;

      let product = null;
      if (mongoose.isValidObjectId(item.productId)) {
        product = await Product.findById(item.productId);
      }
      if (!product && item.productName) {
        product = await Product.findOne({
          name: new RegExp(`^${item.productName.trim()}$`, "i"),
        });
      }

      if (product) {
        product.stock = (product.stock || 0) + quantityToAdd;
        product.costPrice = unitCost;
        if (supplierName) product.supplier = supplierName;
        product.isActive = true;
        await product.save();
      } else if (item.productName && item.productName.trim()) {
        const defaultCat = await Category.findOne();
        if (defaultCat) {
          const simpleSlug = item.productName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[đĐ]/g, "d")
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .trim();
          await Product.create({
            name: item.productName.trim(),
            slug: `${simpleSlug}-${Date.now().toString().slice(-4)}`,
            price: Math.round(unitCost * 1.4) || 20000,
            costPrice: unitCost,
            stock: quantityToAdd,
            category: defaultCat._id,
            supplier: supplierName || "Nhà Cung Cấp Tổng Hợp",
            productType: "yarn_retail",
            images: [
              "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=800&q=80",
            ],
            isActive: true,
          });
        }
      }
    }

    // 3. TỰ ĐỘNG CỘNG DỒN TỔNG TIỀN ĐÃ NHẬP VÀO NHÀ CUNG CẤP
    if (mongoose.isValidObjectId(supplierId)) {
      await Supplier.findByIdAndUpdate(supplierId, {
        $inc: { totalImported: calculatedTotal, importCount: 1 },
      });
    }

    res.status(201).json({
      receipt,
      message: `🎉 Nhập kho thành công! Đã tự động cộng dồn ${items.reduce((s, i) => s + Number(i.quantity), 0)} sản phẩm vào kho hàng.`,
    });
  } catch (err) {
    res.status(400).json({
      message: "Không thể tạo phiếu nhập hàng",
      error: err.message,
    });
  }
});

router.delete("/imports/:id", async (req, res) => {
  try {
    await ImportReceipt.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa phiếu nhập hàng" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa phiếu nhập", error: err.message });
  }
});

// ==========================================
// 🪡 QUẢN LÝ THỢ MÓC & NHÂN SỰ (STAFF)
// ==========================================
router.get("/staff", async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query = {
        $or: [
          { name: regex },
          { phone: regex },
          { role: regex },
          { skills: regex },
        ],
      };
    }
    const staff = await Staff.find(query).sort({ createdAt: -1 });
    res.json(staff);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi tải danh sách nhân viên", error: err.message });
  }
});

router.post("/staff", async (req, res) => {
  try {
    const member = await Staff.create(req.body);
    res.status(201).json(member);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể thêm nhân sự", error: err.message });
  }
});

router.put("/staff/:id", async (req, res) => {
  try {
    const member = await Staff.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
      runValidators: true,
    });
    if (!member)
      return res.status(404).json({ message: "Không tìm thấy nhân sự" });
    res.json(member);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Không thể cập nhật nhân sự", error: err.message });
  }
});

router.delete("/staff/:id", async (req, res) => {
  try {
    await Staff.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa nhân sự" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi xóa nhân sự", error: err.message });
  }
});

// ==========================================
// 🧶 LỆNH GIAO VIỆC GIA CÔNG MÓC LEN & TÍNH CÔNG THỢ (ARTISAN TASKS)
// HỖ TRỢ: MÓC PHÔI 1K, MÓC RÁP 2K, TRỌN GÓI
// TỰ ĐỘNG CỘNG THÀNH PHẨM VÀO KHO KHI NGHIỆM THU
// ==========================================
router.get("/artisan-tasks", async (req, res) => {
  try {
    const tasks = await ArtisanTask.find()
      .populate("staff", "name phone role stageRates pendingPayment")
      .populate("product", "name stock price images")
      .sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi tải lệnh giao việc thợ", error: err.message });
  }
});

router.post("/artisan-tasks", async (req, res) => {
  try {
    const {
      staffId,
      taskName,
      productId,
      productName,
      stage,
      materialsIssued,
      quantityTarget,
      unitRate,
      deadline,
      notes,
    } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff)
      return res.status(404).json({ message: "Không tìm thấy thợ móc này" });

    let finalProductName = productName;
    if (!finalProductName && mongoose.isValidObjectId(productId)) {
      const prod = await Product.findById(productId);
      if (prod) finalProductName = prod.name;
    }

    const rate = Number(unitRate) || (stage === "assembly" ? 2000 : 1000);
    const target = Number(quantityTarget) || 1;
    const estimatedWages = rate * target;
    const taskCode = `GC-${Date.now().toString().slice(-6)}`;

    const task = await ArtisanTask.create({
      code: taskCode,
      staff: staff._id,
      staffName: staff.name,
      staffPhone: staff.phone,
      taskName:
        taskName ||
        `Giao việc: ${stage === "raw_part" ? "Móc phôi chi tiết" : stage === "assembly" ? "Móc ráp hoàn thiện" : "Móc trọn gói"} - ${finalProductName || "Mẫu len"}`,
      product: mongoose.isValidObjectId(productId) ? productId : undefined,
      productName: finalProductName || "Mẫu len thủ công",
      stage: stage || "raw_part",
      materialsIssued: materialsIssued || "Len Milk Cotton + Phụ liệu",
      quantityTarget: target,
      unitRate: rate,
      estimatedWages,
      quantityCompleted: 0,
      actualWages: 0,
      status: "assigned",
      deadline: deadline || "",
      notes: notes || "",
    });

    res.status(201).json({
      task,
      message: `🌸 Đã phát len và giao việc cho ${staff.name} thành công!`,
    });
  } catch (err) {
    res.status(400).json({
      message: "Không thể tạo lệnh giao việc gia công",
      error: err.message,
    });
  }
});

// NGHIỆM THU HÀNG NỘP & TỰ ĐỘNG CỘNG KHO SẢN PHẨM NẾU LÀ CÔNG ĐOẠN RÁP HOÀN THIỆN
router.put("/artisan-tasks/:id/inspect", async (req, res) => {
  try {
    const { quantityCompleted, notes } = req.body;
    const task = await ArtisanTask.findById(req.params.id);
    if (!task)
      return res.status(404).json({ message: "Không tìm thấy lệnh gia công" });

    const completed = Number(quantityCompleted) || 0;
    const earnedWages = completed * task.unitRate;

    task.quantityCompleted = completed;
    task.actualWages = earnedWages;
    task.status = "inspected_passed";
    task.inspectedAt = new Date();
    if (notes) task.notes = (task.notes ? task.notes + " | " : "") + notes;

    // 1. Tự động ghi nhận tiền công cho thợ
    await Staff.findByIdAndUpdate(task.staff, {
      $inc: {
        completedCount: completed,
        pendingPayment: earnedWages,
      },
    });

    // 2. TỰ ĐỘNG CỘNG TỒN KHO THÀNH PHẨM VÀO SẢN PHẨM BÁN TRÊN WEB
    // Nếu là công đoạn Móc ráp hoàn thiện (assembly) hoặc Móc trọn gói (full_item)
    let autoStockAdded = false;
    let addedStockQty = 0;

    if (
      (task.stage === "assembly" || task.stage === "full_item") &&
      !task.autoStockAdded &&
      completed > 0
    ) {
      let product = null;
      if (mongoose.isValidObjectId(task.product)) {
        product = await Product.findById(task.product);
      }
      if (!product && task.productName) {
        product = await Product.findOne({
          name: new RegExp(`^${task.productName.trim()}$`, "i"),
        });
      }

      if (product) {
        product.stock = (product.stock || 0) + completed;
        product.artisan = task.staffName;
        product.productType = "outsourced"; // Đánh dấu là hàng thợ gia công
        await product.save();
        autoStockAdded = true;
        addedStockQty = completed;
        task.autoStockAdded = true;
        task.addedStockQty = completed;
      }
    }

    await task.save();

    res.json({
      task,
      autoStockAdded,
      addedStockQty,
      message: `✅ Đã nghiệm thu ${completed} sản phẩm! Tiền công thợ: ${earnedWages.toLocaleString("vi-VN")}đ.${
        autoStockAdded
          ? ` Đã tự động cộng ${addedStockQty} thành phẩm vào kho bán online!`
          : ""
      }`,
    });
  } catch (err) {
    res.status(400).json({
      message: "Không thể nghiệm thu lệnh gia công",
      error: err.message,
    });
  }
});

// THANH TOÁN TIỀN CÔNG CHO THỢ
router.put("/artisan-tasks/:id/pay", async (req, res) => {
  try {
    const task = await ArtisanTask.findById(req.params.id);
    if (!task)
      return res.status(404).json({ message: "Không tìm thấy lệnh gia công" });

    if (task.status === "paid") {
      return res.status(400).json({ message: "Lệnh này đã được thanh toán tiền công trước đó" });
    }

    const payAmount = task.actualWages || task.estimatedWages || 0;
    task.status = "paid";
    task.paidAt = new Date();
    await task.save();

    // Cập nhật hồ sơ thợ: cộng tiền đã thanh toán, trừ tiền công nợ chờ trả
    await Staff.findByIdAndUpdate(task.staff, {
      $inc: {
        totalPaid: payAmount,
        pendingPayment: -payAmount,
      },
    });

    res.json({
      task,
      message: `💵 Đã thanh toán ${payAmount.toLocaleString("vi-VN")}đ tiền công cho thợ ${task.staffName}!`,
    });
  } catch (err) {
    res.status(400).json({
      message: "Không thể thanh toán tiền công",
      error: err.message,
    });
  }
});

router.delete("/artisan-tasks/:id", async (req, res) => {
  try {
    await ArtisanTask.findByIdAndDelete(req.params.id);
    res.json({ message: "Đã xóa lệnh gia công" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Lỗi xóa lệnh gia công", error: err.message });
  }
});

// UPLOAD ẢNH SẢN PHẨM (Hỗ trợ Cloudinary hoặc Base64 an toàn)
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn tệp hình ảnh" });
    }

    const hasCloudinary =
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET;

    if (hasCloudinary) {
      try {
        const streamUpload = (buffer) => {
          return new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: "sene-handmade" },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            stream.end(buffer);
          });
        };

        const uploadResult = await streamUpload(req.file.buffer);
        return res.json({
          url: uploadResult.secure_url,
          message: "Tải ảnh lên Cloudinary thành công",
        });
      } catch (cloudErr) {
        console.warn("Cloudinary upload failed, falling back to base64:", cloudErr.message);
      }
    }

    // Fallback nếu chưa cấu hình Cloudinary: Lưu Base64 Data URL
    const mime = req.file.mimetype || "image/jpeg";
    const base64 = req.file.buffer.toString("base64");
    const dataUrl = `data:${mime};base64,${base64}`;

    res.json({
      url: dataUrl,
      message: "Tải ảnh lên thành công",
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi tải ảnh lên máy chủ",
      error: error.message,
    });
  }
});

module.exports = router;
