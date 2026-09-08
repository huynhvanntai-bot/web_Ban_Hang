const app = require("./app");
const connectDatabase = require("./config/database");

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`🌸 Sene Handmade API server đang chạy tại http://localhost:${port}`);
  });
}

startServer();
