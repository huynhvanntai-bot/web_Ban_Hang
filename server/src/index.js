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

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/promotions", promotionRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Tiệm Len Sợi & Handmade API đang hoạt động",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "not-connected",
  });
});

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`API server đang chạy tại http://localhost:${port}`);
  });
}

startServer();
