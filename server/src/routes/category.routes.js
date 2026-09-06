const express = require("express");
const Category = require("../models/category.model");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể tải danh mục", error: error.message });
  }
});

module.exports = router;
