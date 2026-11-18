import db from "../../config/db.js";

// POST: Create Enquiry
export const createEnquiry = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and phone are required fields."
      });
    }

    const sql = "INSERT INTO enquiries (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [name, email, phone, subject || null, message || null]);

    return res.status(201).json({
      success: true,
      message: "Enquiry submitted successfully.",
      enquiryId: result.insertId
    });
  } catch (err) {
    console.error("Create Enquiry Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error",
      error: err.message
    });
  }
};

// GET: Enquiries List (Dashboard / View)
export const getEnquiries = async (req, res) => {
  try {
    const sql = "SELECT * FROM enquiries ORDER BY id DESC";
    const [rows] = await db.query(sql);

    return res.render("enquiries", {
      title: "Enquiries Dashboard",
      enquiries: rows,
    });
  } catch (err) {
    console.error("Get Enquiries Error:", err);
    return res.status(500).send("Database error: " + err.message);
  }
};

// GET / DELETE: Delete Enquiry
export const deleteEnquiries = async (req, res) => {
  try {
    const { id } = req.params;
    const sql = "DELETE FROM enquiries WHERE id = ?";
    const [result] = await db.query(sql, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Enquiry not found");
    }

    return res.redirect("/admin/enquiries");
  } catch (err) {
    console.error("Delete Enquiry Error:", err);
    return res.status(500).send("Database error: " + err.message);
  }
};