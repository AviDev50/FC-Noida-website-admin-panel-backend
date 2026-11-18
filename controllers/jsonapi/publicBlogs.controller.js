import db from "../../config/db.js";

export const getPublishedBlogs = async (req, res, next) => {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const offset = (page - 1) * limit;

    const [blogs] = await db.query(
      `SELECT b.id, b.title, b.slug, b.short_description, b.image, b.author_name,
              b.reading_time, b.created_at, c.category_name
       FROM blogs b LEFT JOIN blog_category c ON b.category_id = c.category_id
       WHERE b.status = 'published'
       ORDER BY b.id DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    res.json({ success: true, page, data: blogs });
  } catch (e) { next(e); }
};

export const getPublishedBlogBySlug = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, c.category_name FROM blogs b
       LEFT JOIN blog_category c ON b.category_id = c.category_id
       WHERE b.slug = ? AND b.status = 'published'`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Blog not found" });
    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
};