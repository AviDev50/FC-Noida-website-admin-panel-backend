import db from "../config/db.js";

// ================= ADD USER =================
export const addUser = async (req, res) => {
  try {
    const { name, age, distance } = req.body;

    if (!name || !age || !distance) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Image filename (DB me store karne ke liye)
    const img = req.file ? req.file.filename : null;

    const sql =
      "INSERT INTO chatUi (name, age, distance, img) VALUES (?, ?, ?, ?)";
    const [result] = await db.query(sql, [name, age, distance, img]);

    // Frontend-ready full image URL
    const imageUrl = img
      ? `${req.protocol}://${req.get("host")}/public/uploads/${img}`
      : null;

    return res.status(201).json({
      success: true,
      message: "User added successfully",
      userId: result.insertId,
      img: imageUrl,
    });
  } catch (err) {
    console.error("Add Chat User Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error: " + err.message,
    });
  }
};

// ================= GET ALL USERS =================
export const getUsers = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM chatUi ORDER BY id DESC");

    // Map array for full image URLs
    const usersWithImageUrl = rows.map((user) => ({
      ...user,
      img: user.img
        ? `${req.protocol}://${req.get("host")}/public/uploads/${user.img}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      total: usersWithImageUrl.length,
      users: usersWithImageUrl,
    });
  } catch (err) {
    console.error("Get Chat Users Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error: " + err.message,
    });
  }
};