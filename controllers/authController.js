import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= SIGNUP =================
export const signup = async (req, res) => {
  const { name, username, email, password, phone, age  } = req.body;

  if (!name || !username || !email || !password || !phone || !age) {
    return res.status(400).json({
      message: "All fields are required",
    });
  }

  const checkQuery =
    "SELECT id FROM users WHERE phone = ? OR email = ? OR username = ?";

  db.query(checkQuery, [phone, email, username], async (err, result) => {
    if (err)
      return res.status(500).json({
        message: "Database error",
      });

    if (result.length > 0) {
      return res.status(400).json({
        message: "Phone, email or username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql =
      "INSERT INTO users (name, age , username, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(
      sql,
      [name, age , username, email, hashedPassword, phone],
      (err, result) => {
        if (err)
          return res.status(500).json({
            message: "Signup failed",
          });

        res.status(201).json({
          success: true,
          message: "Signup successful",
          user: {
            userId: result.insertId,
            name,
            age ,
            username,
            email,
            phone,
          },
        });
      }
    );
  });
};

// ================= LOGIN =================
export const login = (req, res) => {
  const { phone } = req.body;

  if (!phone)
    return res.status(400).json({
      message: "Phone required",
    });

  db.query(
    "SELECT id AS userId, name, phone FROM users WHERE phone = ?",
    [phone],
    (err, result) => {
      if (err)
        return res.status(500).json({
          message: "Database error",
        });

      if (result.length === 0)
        return res.status(400).json({
          message: "User not found",
        });

      const user = result[0];

      const token = jwt.sign(
        { id: user.userId, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user,
      });
    }
  );
};

// ================= PROFILE =================
export const getUserProfile = (req, res) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  const userId = req.user.id;

  const sql = "SELECT name, age, username FROM users WHERE id = ?";

  db.query(sql, [userId], (err, result) => {
    if (err)
      return res.status(500).json({
        message: "DB error",
      });

    if (result.length === 0)
      return res.status(404).json({
        message: "User not found",
      });

    // Format age to YYYY-MM-DD
    if (result[0].age) {
      result[0].age = result[0].age.toISOString().split("T")[0];
    }

    res.json({
      success: true,
      user: result[0],
    });
  });
};

// --- GET USERS LIST
export const getUsersList = (req, res) => {
  const sql = "SELECT id, name, email, phone FROM users ORDER BY id DESC";

  db.query(sql, (err, result) => {
    if (err)
      return res.status(500).json({
        message: "Database error",
        err,
      });

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      total: result.length,
      users: result,
    });
  });
};
