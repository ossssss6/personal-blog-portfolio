// 导入 mongoose 模块
const mongoose = require("mongoose");

// 定义 Schema 构造函数，方便引用
const Schema = mongoose.Schema;

// 定义文章的 Schema (模式)
const postSchema = new Schema(
  {
    title: {
      type: String, // 字段类型：字符串
      required: true, // 是否必填：是
      trim: true, // 是否移除前后的空格：是
      minlength: 3, // 最小长度
      maxlength: 150, // 最大长度
    },
    slug: {
      // 用于生成对 SEO 友好的 URL
      type: String,
      required: true,
      unique: true, // 是否唯一：是，确保每篇文章的 slug 不同
      trim: true,
      lowercase: true, // 转换为小写
    },
    content: {
      type: String, // 文章内容，通常是 Markdown 格式
      required: true,
    },
    author: {
      // 作者信息
      type: String, // 初期我们可以简单地存一个作者名字符串
      // 进阶：这里未来可以改为 type: Schema.Types.ObjectId, ref: 'User' 来关联 User 模型
      required: false, // 根据你的需求，是否必填
      default: "Anonymous Author", // 默认作者名
    },
    tags: {
      // 标签
      type: [String], // 字符串数组，表示可以有多个标签
      trim: true,
      lowercase: true,
    },
    status: {
      // 文章状态
      type: String,
      enum: ["draft", "published", "archived"], // 枚举类型，只能是这三个值之一
      default: "draft", // 默认状态为草稿
    },
  },
  {
    timestamps: true, // 这个选项会自动为你的文档添加 createdAt 和 updatedAt 两个时间戳字段
  }
);

// 根据 Schema 创建并导出 Post 模型
// mongoose.model 的第一个参数是模型的单数名称，Mongoose 会自动将其转换为复数形式作为数据库中的集合名 (collection name)
// 例如，这里是 'Post'，对应的集合名会是 'posts'
const Post = mongoose.model("Post", postSchema);

module.exports = Post;
