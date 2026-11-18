import db from "../../config/db.js";

// ================= CREATE ENQUIRY =================
export const createUser = async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const sql = "INSERT INTO School_inquiries (name, email, phone) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [name, email, phone]);

    return res.status(201).json({
      success: true,
      message: "Enquiry created successfully",
      id: result.insertId,
    });
  } catch (err) {
    console.error("Create School Enquiry Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message,
    });
  }
};

// ================= GET ALL ENQUIRIES =================
export const getUsers = async (req, res) => {
  try {
    const sql = "SELECT * FROM School_inquiries ORDER BY id DESC";
    const [result] = await db.query(sql);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    console.error("Get School Enquiries Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message,
    });
  }
};

// ================= DELETE ENQUIRY =================
export const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Enquiry ID is required",
      });
    }

    const sql = "DELETE FROM School_inquiries WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Enquiry deleted successfully",
    });
  } catch (err) {
    console.error("Delete School Enquiry Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message,
    });
  }
};