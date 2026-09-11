


import db from "../../config/db.js";

//  CREATE ENQUIRY
export const createUser = (req, res) => {
  const { name, email, phone } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const sql = "INSERT INTO School_inquiries (name, email, phone) VALUES (?, ?, ?)";

  db.query(sql, [name, email, phone], (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Enquiry created",
    });
  });
};

//  GET
export const getUsers = (req, res) => {
  const sql = "SELECT * FROM School_inquiries ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
      });
    }

    res.json({
      success: true,
      data: result,
    });
  });
};

// DELETE ENQUIRY
export const deleteEnquiry = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Enquiry ID is required",
    });
  }

  const sql = "DELETE FROM School_inquiries WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        success: false,
        message: "Database error",
      });
    }

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
  });
};