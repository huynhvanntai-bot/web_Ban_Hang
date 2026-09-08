const mongoose = require("mongoose");

let cachedPromise = null;

const DEFAULT_MONGODB_URI =
  "mongodb+srv://huynhvanntai_db_user:040102@cluster0.v5xasex.mongodb.net/tai-computer-shop?appName=Cluster0";

async function connectDatabase() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || DEFAULT_MONGODB_URI;

  if (cachedPromise) {
    return cachedPromise;
  }

  try {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    await cachedPromise;
    console.log("Đã kết nối MongoDB Atlas thành công!");
    return mongoose.connection;
  } catch (error) {
    cachedPromise = null;
    console.error("Không thể kết nối MongoDB Atlas:", error.message);
    throw error;
  }
}

module.exports = connectDatabase;
