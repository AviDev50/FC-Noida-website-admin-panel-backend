import db from "../../config/db.js";

// POST: Create new employee
export const createProfile = async (req, res) => {
  try {
    const { name, profile } = req.body;

    if (!name || !profile || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Name, profile and image are required"
      });
    }

    const image = req.file.filename;
    const sql = "INSERT INTO employees (name, image, profile) VALUES (?, ?, ?)";
    await db.query(sql, [name, image, profile]);

    return res.redirect("/admin/employees");
  } catch (err) {
    console.error("Create Profile Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// GET: All employees list
export const getEmployees = async (req, res) => {
  try {
    const sql = "SELECT * FROM employees ORDER BY created_at DESC";
    const [result] = await db.query(sql);

    return res.render("employees", { employees: result });
  } catch (err) {
    console.error("Get Employees Error:", err);
    return res.status(500).send("Database Error: " + err.message);
  }
};

// DELETE / GET: Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM employees WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        message: "Employee not found!",
      });
    }

    return res.redirect("/admin/employees");
  } catch (err) {
    console.error("Delete Employee Error:", err);
    return res.status(500).json({
      message: "Database error",
      error: err.message,
    });
  }
};

// GET: Show add employee form (Fixed syntax error)
export const showAddEmployeeForm = (req, res) => {
  res.render("addEmployee", {
    title: "Add Employee"
  });
};