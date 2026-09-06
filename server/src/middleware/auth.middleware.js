const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Vui lòng đăng nhập" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-password");
    if (!user)
      return res.status(401).json({ message: "Tài khoản không tồn tại" });

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
  }
}

async function optionalProtect(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(payload.id).select("-password");
  } catch (error) {
    req.user = null;
  }
  next();
}

function authorizeAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Bạn không có quyền admin" });
  }
  next();
}

module.exports = { protect, optionalProtect, authorizeAdmin };
