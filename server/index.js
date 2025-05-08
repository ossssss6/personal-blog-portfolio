// 0. 尽早加载 dotenv，以便后续代码可以使用环境变量
require("dotenv").config();

// 1. 导入 Express 和 Mongoose 模块
const express = require("express");
const mongoose = require("mongoose");

// 2. 创建 Express 应用实例
const app = express();

// 3. 定义端口号
const PORT = process.env.PORT || 3001;

// 获取数据库连接 URI
const MONGODB_URI = process.env.MONGODB_URI;

// 4. 定义一个简单的路由处理器
app.get("/", (req, res) => {
  res.send(
    "Hello from Express Server! Now with MongoDB connection (hopefully)."
  );
});

// 5. 连接到 MongoDB 数据库并启动服务器
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Successfully connected to MongoDB Atlas!");
    // 只有数据库连接成功后才启动 Express 服务器
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB Atlas:", error.message);
    // 如果数据库连接失败，可以选择不启动服务器或进行其他处理
    process.exit(1); // 退出进程，表示启动失败
  });
