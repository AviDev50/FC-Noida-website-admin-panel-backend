import db from "../../config/db.js";
import { getPagination, paginated } from "../../utils/db.js";
import { imageUrl } from "../../utils/files.js";

const withImage = (b) => ({ ...b, image_url: imageUrl(b.image) });

const LIST_COLS = `b.id, b.title, b.slug, b.short_description, b.image, b.image_alt,
  b.author_name, b.reading_time, b.views, b.is_featured, b.published_at, b.created_at,
  c.category_name, c.slug AS category_slug`;

// GET /api/blogs
export const getPublishedBlogs = async (req, res, next) => {
  try {
    const pg = getPagination(req.query, 10, 50);
    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM blogs WHERE status = 'published'");
    const [blogs] = await db.query(
      `SELECT ${LIST_COLS}
       FROM blogs b LEFT JOIN blog_category c ON b.category_id = c.category_id
       WHERE b.status = 'published'
       ORDER BY COALESCE(b.published_at, b.created_at) DESC
       LIMIT ? OFFSET ?`,
      [pg.limit, pg.offset]
    );
    res.json(paginated(blogs.map(withImage), total, pg));
  } catch (e) { next(e); }
};

// GET /api/blogs/:slug
export const getPublishedBlogBySlug = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, c.category_name, c.slug AS category_slug
       FROM blogs b LEFT JOIN blog_category c ON b.category_id = c.category_id
       WHERE b.slug = ? AND b.status = 'published'`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Blog not found" });

    db.query("UPDATE blogs SET views = views + 1 WHERE id = ?", [rows[0].id]).catch(() => {});
    res.json({ success: true, data: withImage(rows[0]) });
  } catch (e) { next(e); }
};

// GET /api/categories
export const getPublicCategories = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT c.category_id, c.category_name, c.slug, COUNT(b.id) AS blog_count
       FROM blog_category c
       LEFT JOIN blogs b ON b.category_id = c.category_id AND b.status = 'published'
       GROUP BY c.category_id, c.category_name, c.slug
       ORDER BY c.category_name`
    );
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

// GET /api/categories/:slug
export const getPublishedBlogsByCategory = async (req, res, next) => {
  try {
    const [[category]] = await db.query(
      "SELECT category_id, category_name, slug FROM blog_category WHERE slug = ?",
      [req.params.slug]
    );
    if (!category) return res.status(404).json({ success: false, message: "Category not found" });

    const pg = getPagination(req.query, 10, 50);
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM blogs WHERE category_id = ? AND status = 'published'",
      [category.category_id]
    );
    const [blogs] = await db.query(
      `SELECT ${LIST_COLS}
       FROM blogs b LEFT JOIN blog_category c ON b.category_id = c.category_id
       WHERE b.category_id = ? AND b.status = 'published'
       ORDER BY COALESCE(b.published_at, b.created_at) DESC
       LIMIT ? OFFSET ?`,
      [category.category_id, pg.limit, pg.offset]
    );
    res.json({ ...paginated(blogs.map(withImage), total, pg), category });
  } catch (e) { next(e); }
};