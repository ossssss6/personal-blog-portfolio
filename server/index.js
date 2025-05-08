// 1. 导入 Express 模块
const express = require("express");

// 2. 创建 Express 应用实例
const app = express();

// 3. 定义端口号
//    process.env.PORT 是为了兼容部署平台可能指定的端口，
//    如果没有指定，则使用 3001 (避免与前端的 5173 冲突)
const PORT = process.env.PORT || 3001;

// 4. 定义一个简单的路由处理器
//    当用户访问根路径 (/) 时，服务器会响应 "Hello from Express Server!"
app.get("/", (req, res) => {
  res.send("Hello from Express Server!");
});

// 5. 启动服务器并监听指定端口
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
