import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// ================= SIGNUP =================
export const signup = async (req, res) => {
  try {
    const { name, username, email, password, phone, age } = req.body;

    if (!name || !username || !email || !password || !phone || !age) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 1. Check if user already exists
    const checkQuery =
      "SELECT id FROM users WHERE phone = ? OR email = ? OR username = ?";
    const [existingUsers] = await db.query(checkQuery, [phone, email, username]);

    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Phone, email, or username already exists",
      });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert new user record
    const insertQuery =
      "INSERT INTO users (name, age, username, email, password, phone) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await db.query(insertQuery, [
      name,
      age,
      username,
      email,
      hashedPassword,
      phone,
    ]);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      user: {
        userId: result.insertId,
        name,
        age,
        username,
        email,
        phone,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error during signup: " + error.message,
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone required",
      });
    }

    const [users] = await db.query(
      "SELECT id AS userId, name, phone FROM users WHERE phone = ?",
      [phone]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const user = users[0];
    const secretKey = process.env.JWT_SECRET || "shiv@12";

    const token = jwt.sign(
      { id: user.userId, phone: user.phone },
      secretKey,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error during login: " + error.message,
    });
  }
};

// ================= PROFILE =================
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId = req.user.id;
    const sql = "SELECT name, age, username FROM users WHERE id = ?";
    const [users] = await db.query(sql, [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userData = users[0];

    // Format age date to YYYY-MM-DD
    if (userData.age instanceof Date) {
      userData.age = userData.age.toISOString().split("T")[0];
    }

    return res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error: " + error.message,
    });
  }
};

// ================= GET USERS LIST =================
export const getUsersList = async (req, res) => {
  try {
    const sql = "SELECT id, name, email, phone FROM users ORDER BY id DESC";
    const [users] = await db.query(sql);

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      total: users.length,
      users,
    });
  } catch (error) {
    console.error("Users List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Database error: " + error.message,
    });
  }
};