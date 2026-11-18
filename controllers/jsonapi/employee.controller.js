import db from "../../config/db.js";
import { getPagination, paginated } from "../../utils/db.js";
import { removeFile, UPLOAD_DIR } from "../../utils/files.js";
import { bad, isStr } from "../../utils/validate.js";

export const getEmployees = async (req, res, next) => {
  try {
    const pg = getPagination(req.query, 20);
    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM employees");
    const [rows] = await db.query("SELECT * FROM employees ORDER BY id DESC LIMIT ? OFFSET ?", [pg.limit, pg.offset]);
    res.json(paginated(rows, total, pg));
  } catch (e) { next(e); }
};

export const createProfile = async (req, res, next) => {
  const image = req.file?.filename ?? null;
  try {
    const { name, profile } = req.body;
    if (!isStr(name, 100)) {
      removeFile(UPLOAD_DIR, image);
      return bad(res, "Name is required.");
    }
    const [result] = await db.query(
      "INSERT INTO employees (name, image, profile) VALUES (?, ?, ?)",
      [name.trim(), image, typeof profile === "string" ? profile.trim() : null]
    );
    res.status(201).json({ success: true, message: "Employee added successfully.", employeeId: result.insertId });
  } catch (e) {
    removeFile(UPLOAD_DIR, image);
    next(e);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const [[row]] = await db.query("SELECT image FROM employees WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ success: false, message: "Employee record not found." });

    await db.query("DELETE FROM employees WHERE id = ?", [req.params.id]);
    removeFile(UPLOAD_DIR, row.image);
    res.json({ success: true, message: "Employee deleted successfully." });
  } catch (e) { next(e); }
};