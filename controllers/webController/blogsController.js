import db from "../../config/db.js";
import slugify from "slugify";

// Create Blog
export const createBlog = (req, res) => {
  const {
    category_id,
    title,
    short_description,
    content,
    status,

    meta_title,
    meta_description,

    image_alt,

    author_name,

    reading_time,

    published_at,

    is_featured,
  } = req.body;

  const image = req.file ? req.file.filename : null;

  let { slug } = req.body;

  // Auto-generate slug
  if (!slug || slug.trim() === "") {
    slug = slugify(title, {
      lower: true,
      strict: true,
    });
  }

  const sql = `
    INSERT INTO blogs (
      category_id,
      title,
      slug,
      short_description,
      content,
      status,
      image,

      meta_title,
      meta_description,

      image_alt,

      author_name,

      reading_time,

      published_at,

      is_featured
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    category_id || null,
    title,
    slug,
    short_description,
    content,
    status || "draft",
    image,

    meta_title || null,
    meta_description || null,

    image_alt || null,

    author_name || "Founder Code Team",

    reading_time || 1,

    published_at || null,

    is_featured || 0,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Create Blog Error:", err);

      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }

    return res.redirect("/admin/blogs");
  });
};

// Get all blogs
export const getBlogs = (req, res) => {
  const sql = "SELECT * FROM blogs";
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send("Database Error: " + err.message);
    res.render("blogs", { title: "All Blogs", blogs: result});
  });
  console.log(result)
};

//delete blog
export const deleteBlogs = (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM blogs WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      return res.status(500).json({
        message: "Database error",
        error: err,
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Blog not found!",
      });
    }

    // return res.status(200).json({
    //   message: "Blog deleted successfully",

    // });
    res.redirect("/admin/blogs");
  });
};

//Get blogs by category_id
export const getBlogsByCategory = (req, res) => {
  const categoryId = req.query.category_id;

  let sql = `
    SELECT 
      blogs.id,
      blogs.title,
      blogs.slug,
      blogs.status,
      blogs.short_description,
      blogs.content,
      blogs.image,
      blog_category.category_name,
      blog_category.category_id
    FROM blogs
    LEFT JOIN blog_category 
      ON blogs.category_id = blog_category.category_id
  `;

  const params = [];

  // If categoryId is provided, filter by category
  if (categoryId) {
    sql += " WHERE blogs.category_id = ?";
    params.push(categoryId);
  }

  sql += " ORDER BY blogs.created_at DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: "No blogs found" });
    }

    res.json(result);
  });
};

// dropdown ke liye

export function showAddBlogForm(req, res) {
  const sql = "SELECT * FROM blog_category";

  db.query(sql, (err, categories) => {
    if (err) {
      return res.status(500).send("Database Error: " + err.message);
    }

    res.render("addBlogs", {
      title: "Add New Blog",
      categories, // dropdown ke liye
    });
  });
}

// ===============================
// BLOG LIST WITH CATEGORY NAME
// ===============================
export const getBlogsWithCategory = (req, res) => {
  const sql = `
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
    ORDER BY blogs.id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).send(err.message);

    res.render("blogs", {
      blogs: result,
    });
  });
};





// show edit blog form

export const showEditBlogForm = (req, res) => {
  const blogId = req.params.id;

  //Blog data (with selected category)
  const blogSql = `SELECT blogs.*FROM blogs WHERE blogs.id = ?`;

  //All categories (for dropdown)
  const categorySql = `
    SELECT * FROM blog_category
  `;

  db.query(blogSql, [blogId], (err, blogResult) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database error (blog)");
    }

    if (!blogResult.length) {
      return res.status(404).send("Blog not found");
    }

    db.query(categorySql, (err, categoryResult) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Database error (categories)");
      }
      res.render("editBlogForm", {
        blog: blogResult[0],
        categories: categoryResult
      });
    });
  });
};




// Update Blog
export const updateBlogs = (req, res) => {
  const { id } = req.params;

  const { title, slug, short_description, content, status, category_id } = req.body;


  const image = req.file ? req.file.filename : null;

  // Auto-generate slug if empty
  const finalSlug = slug && slug.trim() !== '' ? slug : slugify(title, { lower: true, strict: true });


  let sql = `
    UPDATE blogs 
    SET title = ?, slug = ?, short_description = ?, content = ?, status = ?, category_id = ?
  `;
  const params = [title, finalSlug, short_description, content, status, category_id];

  // Only update image if a new one is uploaded
  if (image) {
    sql += ', image = ?';
    params.push(image);
  }

  sql += ' WHERE id = ?';
  params.push(id);

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).send("Something went wrong while updating the blog.");
    }

    // Redirect to blogs list after successful update
    res.redirect("/admin/blogs");
  });
};







//////////////////////////matka/////////////////////////////
// ✅ IST Date helper
function getTodayDate() {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const year = parts.find(p => p.type === "year").value;
  const month = parts.find(p => p.type === "month").value;
  const day = parts.find(p => p.type === "day").value;

  return `${year}-${month}-${day}`;
}

// ✅ Proper timeout fetch (BEST WAY)
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

// ============================
// 🚀 MAIN API
// ============================
export async function matkaapi(req, res){
    const BASE_URL = "https://matkawebhook.matka-api.online";
  try {
    const username = "7290007278";
    const password = "Matka@1234";

    console.log("🔹 Step 1: Fetching token...");

    // =====================
    // STEP 1: TOKEN
    // =====================
    const tokenRes = await fetchWithTimeout(
      `${BASE_URL}/get-refresh-token-delhi`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username,
          password,
        }),
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

    console.log("✅ Token received:", refreshToken);

    // =====================
    // STEP 2: MARKET DATA
    // =====================
    console.log("🔹 Step 2: Fetching market data...");

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

    console.log("✅ Market data received");
    
    // =====================
    // STEP 3: SEND TO LARAVEL API
    // =====================
    console.log("🔹 Step 3: Sending data to Laravel...");
    
    const laravelRes = await fetchWithTimeout(
      "https://bhaichara.sattakingpro.com/api/store-result", // 👈 change this
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: marketData, // 👈 send full market data
        }),
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
    
    console.log("✅ Data stored in Laravel");
    

    return res.json({
      status: true,
      data: marketData,
    });

  } catch (error) {

    // 🔥 FULL DEBUG (IMPORTANT)
    console.error("❌ FULL ERROR OBJECT:", error);

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






