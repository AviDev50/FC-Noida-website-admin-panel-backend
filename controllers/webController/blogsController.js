import db from "../../config/db.js";
import slugify from "slugify";
import fs from "fs";
import path from "path";

// ================= CREATE BLOG =================
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      category_id,
      short_description,
      content,
      status,
      meta_title,
      meta_description,
      author_name,
      reading_time,
    } = req.body;

    if (!title || title.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Blog title is required.",
      });
    }

    const image = req.file ? req.file.filename : null;
    
    // 1. Slug auto-generate aur unique banana (Duplicate Key error se bachne ke liye)
    let rawSlug = req.body.slug && req.body.slug.trim() !== ""
      ? req.body.slug
      : title;
      
    let baseSlug = slugify(rawSlug, { lower: true, strict: true });
    let finalSlug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    // 2. Foreign Key Safe Parsing (Empty string aane par NULL karein)
    const validCategoryId = category_id && !isNaN(parseInt(category_id)) 
      ? parseInt(category_id) 
      : null;

    const [result] = await db.query(
      `INSERT INTO blogs 
      (title, category_id, slug, short_description, content, status, image, meta_title, meta_description, author_name, reading_time) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title.trim(),
        validCategoryId,
        finalSlug,
        short_description || null,
        content || null,
        status || "draft",
        image,
        meta_title || null,
        meta_description || null,
        author_name || "Founder Code Team",
        reading_time || 1,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Blog created successfully.",
      blogId: result.insertId,
    });
  } catch (error) {
    console.error("Create Blog Error Details:", error);

    // Specific Database Error Handling
    if (error.code === "ER_NO_REFERENCED_ROW_2") {
      return res.status(400).json({
        success: false,
        message: "Selected Category does not exist. Please choose a valid category.",
      });
    }

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "A blog with this slug already exists. Please change the title.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Database error: " + error.message,
    });
  }
};
// ================= GET ALL BLOGS (WITH CATEGORY NAME & FILTER) =================
export const getBlogs = async (req, res) => {
  try {
    const { category_id, status } = req.query;

    let sql = `
      SELECT 
        blogs.id,
        blogs.title,
        blogs.slug,
        blogs.status,
        blogs.image,
        blogs.created_at,
        blogs.short_description,
        blogs.content,
        blogs.category_id,
        blog_category.category_name
      FROM blogs
      LEFT JOIN blog_category 
        ON blogs.category_id = blog_category.category_id
      WHERE 1=1
    `;

    const params = [];

    if (category_id) {
      sql += " AND blogs.category_id = ?";
      params.push(category_id);
    }

    if (status) {
      sql += " AND blogs.status = ?";
      params.push(status);
    }

    sql += " ORDER BY blogs.id DESC";

    const [blogs] = await db.query(sql, params);

    const baseUrl = `${req.protocol}://${req.get("host")}/public/uploads/`;
    const formattedBlogs = blogs.map((b) => ({
      ...b,
      imageUrl: b.image ? `${baseUrl}${b.image}` : null,
    }));

    return res.status(200).json({
      success: true,
      total: formattedBlogs.length,
      data: formattedBlogs,
    });
  } catch (err) {
    console.error("Get Blogs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch blogs: " + err.message,
    });
  }
};

// ================= GET SINGLE BLOG BY ID =================
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        b.*, 
        c.category_name 
      FROM blogs b 
      LEFT JOIN blog_category c ON b.category_id = c.category_id 
      WHERE b.id = ?
    `;

    const [blogs] = await db.query(sql, [id]);

    if (blogs.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found",
      });
    }

    const blog = blogs[0];
    blog.imageUrl = blog.image
      ? `${req.protocol}://${req.get("host")}/public/uploads/${blog.image}`
      : null;

    return res.status(200).json({
      success: true,
      data: blog,
    });
  } catch (err) {
    console.error("Get Blog By ID Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error: " + err.message,
    });
  }
};

// ================= UPDATE BLOG =================
export const updateBlogs = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      short_description,
      content,
      status,
      category_id,
      meta_title,
      meta_description,
      image_alt,
      author_name,
      reading_time,
    } = req.body;

    const [existing] = await db.query("SELECT * FROM blogs WHERE id = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found to update",
      });
    }

    const finalSlug =
      slug && slug.trim() !== ""
        ? slug
        : slugify(title || existing[0].title, { lower: true, strict: true });

    let sql = `
      UPDATE blogs 
      SET 
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        short_description = COALESCE(?, short_description),
        content = COALESCE(?, content),
        status = COALESCE(?, status),
        category_id = COALESCE(?, category_id),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        image_alt = COALESCE(?, image_alt),
        author_name = COALESCE(?, author_name),
        reading_time = COALESCE(?, reading_time)
    `;

    const params = [
      title,
      finalSlug,
      short_description,
      content,
      status,
      category_id || null,
      meta_title,
      meta_description,
      image_alt,
      author_name,
      reading_time,
    ];

    if (req.file) {
      sql += ", image = ?";
      params.push(req.file.filename);

      if (existing[0].image) {
        const oldFilePath = path.join(process.cwd(), "public", "uploads", existing[0].image);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
    }

    sql += " WHERE id = ?";
    params.push(id);

    await db.query(sql, params);

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
    });
  } catch (err) {
    console.error("Update Blog Error:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while updating the blog: " + err.message,
    });
  }
};

// ================= DELETE BLOG =================
export const deleteBlogs = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query("SELECT image FROM blogs WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found!",
      });
    }

    if (rows[0].image) {
      const filePath = path.join(process.cwd(), "public", "uploads", rows[0].image);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await db.query("DELETE FROM blogs WHERE id = ?", [id]);

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully",
    });
  } catch (err) {
    console.error("Delete Blog Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error: " + err.message,
    });
  }
};

// ================= MATKA THIRD PARTY API =================
function getTodayDate() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  return `${year}-${month}-${day}`;
}

async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function matkaapi(req, res) {
  const BASE_URL = "https://matkawebhook.matka-api.online";
  try {
    const username = "7290007278";
    const password = "Matka@1234";

    const tokenRes = await fetchWithTimeout(
      `${BASE_URL}/get-refresh-token-delhi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ username, password }),
      },
      30000
    );

    const tokenText = await tokenRes.text();
    let tokenData;
    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return res.status(500).json({
        status: false,
        message: "Invalid JSON from token API",
        raw: tokenText,
      });
    }

    if (!tokenData.refresh_token) {
      return res.status(400).json({
        status: false,
        message: "Token not found",
        data: tokenData,
      });
    }

    const refreshToken = tokenData.refresh_token;

    const marketRes = await fetchWithTimeout(
      `${BASE_URL}/market-data-delhi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          API_token: refreshToken,
          markte_name: "",
          date: getTodayDate(),
        }),
      },
      60000
    );

    const marketText = await marketRes.text();
    let marketData;
    try {
      marketData = JSON.parse(marketText);
    } catch {
      return res.status(500).json({
        status: false,
        message: "Invalid JSON from market API",
        raw: marketText,
      });
    }

    const laravelRes = await fetchWithTimeout(
      "https://bhaichara.sattakingpro.com/api/store-result",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ data: marketData }),
      },
      30000
    );

    const laravelText = await laravelRes.text();
    let laravelData;
    try {
      laravelData = JSON.parse(laravelText);
    } catch {
      return res.status(500).json({
        status: false,
        message: "Invalid JSON from Laravel API",
        raw: laravelText,
      });
    }

    return res.json({
      status: true,
      data: marketData,
    });
  } catch (error) {
    console.error("Matka API Error:", error);

    let reason = "Unknown error";
    if (error.name === "AbortError") {
      reason = "Request timeout (API too slow or blocked)";
    } else if (error.code === "ENOTFOUND") {
      reason = "DNS failed (domain not resolving)";
    } else if (error.code === "ECONNREFUSED") {
      reason = "Connection refused (API blocked your IP)";
    } else if (error.code === "ETIMEDOUT") {
      reason = "Connection timeout (server blocked)";
    } else if (error.message) {
      reason = error.message;
    }

    return res.status(500).json({
      status: false,
      message: reason,
      error: error.message,
    });
  }
}