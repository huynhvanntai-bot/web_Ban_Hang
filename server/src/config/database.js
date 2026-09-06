const mongoose = require("mongoose");

async function connectDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn(
      "MONGODB_URI chưa được cấu hình. Server chạy không có database.",
    );
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Đã kết nối MongoDB Atlas");
  } catch (error) {
    console.error("Không thể kết nối MongoDB:", error.message);
  }
}

module.exports = connectDatabase;
