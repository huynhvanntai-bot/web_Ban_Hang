require("dotenv").config();

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("./models/user.model");

async function createAdmin() {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)
    throw new Error("Cần ADMIN_EMAIL và ADMIN_PASSWORD trong .env");
  await mongoose.connect(process.env.MONGODB_URI);
  const password = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
  await User.findOneAndUpdate(
    { email: process.env.ADMIN_EMAIL.toLowerCase() },
    {
      name: process.env.ADMIN_NAME || "Tiệm Len Admin",
      email: process.env.ADMIN_EMAIL.toLowerCase(),
      password,
      role: "admin",
    },
    { upsert: true, returnDocument: "after" },
  );
  console.log("Đã tạo/cập nhật tài khoản admin");
  await mongoose.disconnect();
}

createAdmin().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
