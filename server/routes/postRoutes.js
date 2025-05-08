// 导入 express 模块
const express = require("express");
// 创建一个新的路由实例
const router = express.Router();
// 导入 Post 模型
const Post = require("../models/Post"); // 确保路径正确，我们是从 routes 文件夹返回上一级再进入 models
// 导入 pinyin 和 slugify 包 (新增)
const pinyin = require("pinyin");
const slugify = require("slugify"); // 将变量名从 slugifyPackage 修改为 slugify

/**
 * 根据文本生成一个对 URL友好的 slug。
 * 支持中文标题，会先将其转换为拼音。
 * @param {string} text - 需要转换为 slug 的原始文本 (例如文章标题)。
 * @returns {string} 生成的 slug。
 */
function generateSlug(text) {
  if (!text || typeof text !== "string") {
    // 进一步检查 text 是否为字符串
    return ""; // 处理空输入或非字符串输入
  }

  // 1. 将中文转换为拼音
  // pinyin 包将中文文本转换为拼音数组。
  // 例如："你好世界" -> [ ['ni'], ['hao'], ['shi'], ['jie'] ]
  // --- 修正了这里的调用方式 ---
  const pinyinArray = pinyin.default(text, {
    // 尝试调用 pinyin.default
    style: pinyin.STYLE_NORMAL, // 假设 STYLE_NORMAL 仍然是 pinyin 对象的属性
    heteronym: false, // 处理多音字时，不返回所有读音，只选择一个常用读音。
    segment: true, // 启用分词。对于包含多个词语的句子，这有助于生成更自然的拼音组合。
  });

  // 2. 将拼音数组连接成字符串
  // 我们将每个字/词的拼音（通常是数组中的第一个元素）用连字符 '-' 连接起来。
  const pinyinString = pinyinArray
    .map((item) => item[0]) // 取出每个字/词的拼音
    .join("-"); // 用连字符连接

  // 3. 使用 slugify 包处理最终的字符串
  // slugify 包会进一步清理字符串，使其适合用作 URL的一部分。
  const generatedSlug = slugify(pinyinString, {
    // 使用修改后的变量名 slugify
    replacement: "-", // 定义用什么字符替换空格和不安全字符（默认为 '-'）
    lower: true, // 将所有字符转换为小写。
    strict: true, // 移除所有不符合 URL 安全规范的字符（除了字母、数字和上面定义的 replacement 字符）。
    // 这是比较严格的模式，能确保 slug 的兼容性。
    locale: "en", // 指定语言环境，有助于处理某些特定语言的字符转换（对于纯拼音，'en' 通常适用）。
  });

  return generatedSlug; // 返回由 slugify 包生成的 slug
}

// 定义创建新文章的路由
// POST /api/posts
router.post("/", async (req, res) => {
  try {
    const { title, content, author, tags, status } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required fields." });
    }

    // 使用新的 generateSlug 函数
    let slug = generateSlug(title); // 注意：这里调用的是我们自己定义的 generateSlug 函数

    // 检查 slug 是否已存在，并确保其唯一性
    let existingPost = await Post.findOne({ slug: slug });
    let counter = 1;
    const originalSlugBase = slug || `untitled-post`; // 如果 slug 为空，提供一个基础

    // 如果 slug 为空 (例如标题只包含特殊字符且被移除，或原始标题为空)，
    // 或者 slug 已存在，则尝试生成新的唯一 slug
    if (!slug || existingPost) {
      // 如果 slug 为空，则使用 originalSlugBase 作为基础
      // 如果 slug 已存在，则使用已有的 slug 作为基础
      let baseForNewLabeling = slug ? slug : originalSlugBase;
      if (!slug && !existingPost) {
        // 特殊情况：初始 slug 为空且数据库中也没有空 slug 的记录（理论上不应有）
        slug = `${originalSlugBase}-${Date.now()}`; // 生成一个基于时间的 slug
      } else {
        // slug 已存在，或初始 slug 为空但 originalSlugBase 不为空
        do {
          slug = `${baseForNewLabeling}-${counter}`;
          existingPost = await Post.findOne({ slug: slug });
          counter++;
        } while (existingPost);
      }
    }
    // 再次确保 slug 不为空，如果上面的逻辑意外导致为空，则提供最终的后备方案
    if (!slug) {
      slug = `post-${Date.now()}`;
    }

    const newPost = new Post({
      title,
      slug,
      content,
      author,
      tags,
      status,
    });

    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error("Error creating post:", error); // 服务器端日志
    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: "Input data validation failed.",
        details: error.errors,
      });
    }
    res
      .status(500)
      .json({ message: "Internal server error, unable to create post." });
  }
});

// 导出路由实例，以便在主应用文件中使用
module.exports = router;
