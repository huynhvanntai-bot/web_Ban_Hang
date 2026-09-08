require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDatabase = require("./config/database");

const productRoutes = require("./routes/product.routes");
const categoryRoutes = require("./routes/category.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const adminRoutes = require("./routes/admin.routes");
const promotionRoutes = require("./routes/promotion.routes");
const customOrderRoutes = require("./routes/customOrder.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware tự động kết nối MongoDB Atlas cho mỗi request trong Serverless
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
  } catch (err) {
    console.warn("DB Auto-connect warning:", err.message);
  }
  next();
});

// Mount các API routes
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/promotions", promotionRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/admin/custom-orders", customOrderRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    storeName: "Sene Handmade",
    message: "Tiệm Len Sene Handmade API đang hoạt động online",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not-connected",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;
