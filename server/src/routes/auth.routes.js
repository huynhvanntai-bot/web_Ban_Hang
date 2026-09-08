const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const { protect } = require("../middleware/auth.middleware");

const router = express.Router();

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    address: user.address,
  };
}

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đủ họ tên, email và mật khẩu" });
    if (password.length < 6)
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự" });

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser)
      return res.status(409).json({ message: "Email đã được sử dụng" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });
    res.status(201).json({ user: safeUser(user), token: createToken(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể đăng ký tài khoản", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email?.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không đúng" });
    }
    res.json({ user: safeUser(user), token: createToken(user) });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Không thể đăng nhập", error: error.message });
  }
});

router.get("/me", protect, (req, res) => res.json({ user: req.user }));

router.put("/profile", protect, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
    if (name && name.trim()) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    await user.save();
    res.json({ message: "Cập nhật thông tin thành công", user: safeUser(user) });
  } catch (error) {
    res.status(500).json({ message: "Lỗi cập nhật thông tin", error: error.message });
  }
});

module.exports = router;
