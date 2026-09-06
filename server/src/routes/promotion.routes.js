const express = require("express");
const Promotion = require("../models/promotion.model");

const router = express.Router();

router.get("/active", async (req, res) => {
  const now = new Date();
  const promotions = await Promotion.find({
    isActive: true,
    startAt: { $lte: now },
    endAt: { $gte: now },
  }).sort({ createdAt: -1 });
  res.json(promotions);
});

module.exports = router;
