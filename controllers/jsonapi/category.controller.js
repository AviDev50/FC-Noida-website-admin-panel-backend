import db from "../../config/db.js";
import { bad, isStr } from "../../utils/validate.js";

export const getCategoryList = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM blog_category ORDER BY category_id DESC");
    res.json({ success: true, data: rows });
  } catch (e) { next(e); }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT * FROM blog_category WHERE category_id = ?", [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, data: rows[0] });
  } catch (e) { next(e); }
};

export const createCategory = async (req, res, next) => {
  try {
    const { category_name } = req.body;
    if (!isStr(category_name, 100)) return bad(res, "category_name is required.");

    const [result] = await db.query("INSERT INTO blog_category (category_name) VALUES (?)", [category_name.trim()]);
    res.status(201).json({ success: true, message: "Category created successfully.", category_id: result.insertId });
  } catch (e) { next(e); } // duplicate => 409 (UNIQUE index lagao)
};

export const deleteCategory = async (req, res, next) => {
  try {
    const [result] = await db.query("DELETE FROM blog_category WHERE category_id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Category not found." });
    res.json({ success: true, message: "Category deleted successfully." });
  } catch (e) { next(e); } // blogs use kar rahe hon to FK => 409 "in use"
};