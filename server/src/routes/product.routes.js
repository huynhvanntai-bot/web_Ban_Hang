const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/product.model");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const filter = { isActive: true };
    const { category, search, featured } = req.query;

    if (category) filter.category = category;
    if (featured === "true") filter.featured = true;
    if (search) filter.$text = { $search: search };

    const products = await Product.find(filter)
      .populate("category", "name slug")
      .sort({ featured: -1, createdAt: -1 });

    res.json({ products, total: products.length });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể tải sản phẩm", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("category", "name slug");

    if (!product)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể tải sản phẩm", error: error.message });
  }
});

module.exports = router;
