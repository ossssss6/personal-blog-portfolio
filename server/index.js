// 0. 尽早加载 dotenv，以便后续代码可以使用环境变量
require("dotenv").config();

// 1. 导入 Express 和 Mongoose 模块
const express = require("express");
const mongoose = require("mongoose");

// 导入文章路由模块
const postRoutes = require("./routes/postRoutes");

// 2. 创建 Express 应用实例
const app = express();

// 3. 定义端口号
const PORT = process.env.PORT || 3001;

// 获取数据库连接 URI
const MONGODB_URI = process.env.MONGODB_URI;

// 中间件 (Middleware)
// 使用 express.json() 中间件来解析 JSON 格式的请求体
app.use(express.json());
// (可选) 解析 URL 编码的请求体 (通常用于 HTML 表单提交)
// app.use(express.urlencoded({ extended: true }));

// 路由 (Routes)
// 将 /api/posts 路径下的所有请求都交给 postRoutes 来处理
app.use("/api/posts", postRoutes);

// 4. 定义一个简单的根路径路由处理器 (用于测试服务器是否运行)
app.get("/", (req, res) => {
  res.send(
    "Hello from Express Server! Now with MongoDB connection and post routes configured."
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
    process.exit(1);
  });
