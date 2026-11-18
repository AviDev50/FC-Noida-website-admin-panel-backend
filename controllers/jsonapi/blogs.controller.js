import db from "../../config/db.js";
import { buildUpdate, pickDefined, emptyToNull, getPagination, paginated } from "../../utils/db.js";
import { removeFile, UPLOAD_DIR } from "../../utils/files.js";
import { bad, isStr } from "../../utils/validate.js";

const STATUSES = ["draft", "published"];
const FIELDS = ["title", "category_id", "slug", "short_description", "content", "status",
  "meta_title", "meta_description", "author_name", "reading_time"];
const NULLABLE = ["category_id", "short_description", "content", "meta_title", "meta_description"];

// GET /api/admin/blogs?page=&limit=&category_id=&status=
export const getBlogsWithCategory = async (req, res, next) => {
  try {
    const { category_id, status } = req.query;
    if (status && !STATUSES.includes(status)) return bad(res, "Invalid status.");

    const where = [];
    const params = [];
    if (category_id) { where.push("b.category_id = ?"); params.push(category_id); }
    if (status) { where.push("b.status = ?"); params.push(status); }
    const clause = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const pg = getPagination(req.query);
    const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM blogs b ${clause}`, params);
    const [rows] = await db.query(
      `SELECT b.id, b.title, b.slug, b.short_description, b.status, b.image, b.category_id,
              b.author_name, b.reading_time, c.category_name
       FROM blogs b LEFT JOIN blog_category c ON b.category_id = c.category_id
       ${clause} ORDER BY b.id DESC LIMIT ? OFFSET ?`,
      [...params, pg.limit, pg.offset]
    );
    res.json(paginated(rows, total, pg));
  } catch (e) { next(e); }
};

// GET /api/admin/blogs/:id
export const getBlogById = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT b.*, c.category_name FROM blogs b
       LEFT JOIN blog_category c ON b.category_id = c.category_id WHERE b.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ success: false, message: "Blog not found." });
    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
};

// POST /api/admin/blogs
export const createBlog = async (req, res, next) => {
  const image = req.file?.filename ?? null;
  try {
    const b = req.body;
    if (!isStr(b.title, 255) || !isStr(b.slug, 255)) {
      removeFile(UPLOAD_DIR, image);
      return bad(res, "title and slug are required.");
    }
    const status = b.status || "draft";
    if (!STATUSES.includes(status)) {
      removeFile(UPLOAD_DIR, image);
      return bad(res, "Invalid status.");
    }

    const [result] = await db.query(
      `INSERT INTO blogs (title, category_id, slug, short_description, content, status, image,
                          meta_title, meta_description, author_name, reading_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.title.trim(), emptyToNull(b.category_id) ?? null, b.slug.trim(),
        emptyToNull(b.short_description) ?? null, emptyToNull(b.content) ?? null,
        status, image, emptyToNull(b.meta_title) ?? null, emptyToNull(b.meta_description) ?? null,
        emptyToNull(b.author_name) ?? "Founder Code Team", Number(b.reading_time) || 1,
      ]
    );
    res.status(201).json({ success: true, message: "Blog created successfully.", blogId: result.insertId });
  } catch (e) {
    removeFile(UPLOAD_DIR, image); // DB fail pe orphan file na bache
    next(e);
  }
};

// PUT /api/admin/blogs/:id
export const updateBlogs = async (req, res, next) => {
  const newImage = req.file?.filename ?? null;
  try {
    const { id } = req.params;
    const data = pickDefined(req.body, FIELDS);

    for (const k of NULLABLE) if (k in data) data[k] = emptyToNull(data[k]);
    if ("title" in data && !isStr(data.title)) throw Object.assign(new Error("title cannot be empty."), { status: 400 });
    if ("slug" in data && !isStr(data.slug)) throw Object.assign(new Error("slug cannot be empty."), { status: 400 });
    if ("status" in data && !STATUSES.includes(data.status)) throw Object.assign(new Error("Invalid status."), { status: 400 });
    if ("reading_time" in data) data.reading_time = Number(data.reading_time) || 1;
    if ("author_name" in data && !isStr(data.author_name)) delete data.author_name;

    const [[old]] = await db.query("SELECT image FROM blogs WHERE id = ?", [id]);
    if (!old) {
      removeFile(UPLOAD_DIR, newImage);
      return res.status(404).json({ success: false, message: "Blog not found." });
    }

    if (newImage) data.image = newImage;
    if (!Object.keys(data).length) return bad(res, "Nothing to update.");

    const [sql, params] = buildUpdate("blogs", "id", id, data);
    await db.query(sql, params);

    if (newImage) removeFile(UPLOAD_DIR, old.image); // purani image hatao
    res.json({ success: true, message: "Blog updated successfully." });
  } catch (e) {
    removeFile(UPLOAD_DIR, newImage);
    next(e);
  }
};

// DELETE /api/admin/blogs/:id
export const deleteBlogs = async (req, res, next) => {
  try {
    const [[row]] = await db.query("SELECT image FROM blogs WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: "Blog not found." });

    await db.query("DELETE FROM blogs WHERE id = ?", [req.params.id]);
    removeFile(UPLOAD_DIR, row.image);
    res.json({ success: true, message: "Blog deleted successfully." });
  } catch (e) { next(e); }
};