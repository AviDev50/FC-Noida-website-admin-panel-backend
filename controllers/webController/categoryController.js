import db from "../../config/db.js";

// Create Category (POST)
export const createCategory = async (req, res) => {
  try {
    const { category_name } = req.body;

    if (!category_name) {
      return res.status(400).send("Category name is required.");
    }

    const sql = "INSERT INTO blog_category (category_name) VALUES (?)";
    await db.query(sql, [category_name]);

    return res.redirect("/admin/category");
  } catch (err) {
    console.error("Create Category Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Delete Category (GET / POST)
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM blog_category WHERE category_id = ?";

    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.redirect("/admin/category");
  } catch (err) {
    console.error("Delete Category Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Get Category By ID (GET)
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "SELECT * FROM blog_category WHERE category_id = ?";

    const [rows] = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    return res.status(200).json({
      message: "Category fetched successfully",
      result: rows[0],
    });
  } catch (err) {
    console.error("Get Category Error:", err);
    return res.status(500).send("Database Error: " + err.message);
  }
};

// Show Add Category Form (UI GET)
export const showAddCategoryForm = (req, res) => {
  res.render("category_add", {
    title: "Add New Category",
  });
};

// Show Category List (UI GET)
export const getCategoryList = async (req, res) => {
  try {
    const sql = "SELECT * FROM blog_category ORDER BY category_id DESC";
    const [category] = await db.query(sql);

    return res.render("category", {
      title: "Category List",
      category,
    });
  } catch (err) {
    console.error("Get Category List Error:", err);
    return res.status(500).send("Database Error: " + err.message);
  }
};