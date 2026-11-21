import db from "../../config/db.js";
import { getPagination, paginated } from "../../utils/db.js";

export const getPublishedBlogsByCategory = async (req, res, next) => {
  try {
    const { category_id } = req.params;

    const [[category]] = await db.query(
      "SELECT category_id, category_name FROM blog_category WHERE category_id = ?",
      [category_id]
    );
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const pg = getPagination(req.query, 10, 50);

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM blogs WHERE category_id = ? AND status = 'published'",
      [category_id]
    );

    const [blogs] = await db.query(
      `SELECT b.id, b.title, b.slug, b.short_description, b.image, b.image_alt,
              b.author_name, b.reading_time, b.views, b.is_featured,
              b.published_at, b.created_at, c.category_name
       FROM blogs b
       LEFT JOIN blog_category c ON b.category_id = c.category_id
       WHERE b.category_id = ? AND b.status = 'published'
       ORDER BY COALESCE(b.published_at, b.created_at) DESC
       LIMIT ? OFFSET ?`,
      [category_id, pg.limit, pg.offset]
    );

    res.json({ ...paginated(blogs, total, pg), category });
  } catch (e) { next(e); }
};

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

export const getPublicCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT c.category_id, c.category_name, COUNT(b.id) AS blog_count
       FROM blog_category c
       LEFT JOIN blogs b ON b.category_id = c.category_id AND b.status = 'published'
       GROUP BY c.category_id, c.category_name
       ORDER BY c.category_name`
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};