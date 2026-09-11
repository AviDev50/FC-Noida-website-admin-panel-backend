 import db from "../config/db.js";
//  ADD USER

export const addUser = (req, res) => {
  const { name, age, distance } = req.body;

  if (!name || !age || !distance) {
    return res.status(400).json({ message: "All fields required" });
  }

  // Image filename (DB me)
  const img = req.file ? req.file.filename : null;

  const sql =
    "INSERT INTO chatUi (name, age, distance, img) VALUES (?, ?, ?, ?)";

  db.query(sql, [name, age, distance, img], (err, result) => {
    if (err) {
      return res.status(500).json({ message: "DB Error", err });
    }

    // 🔥 Frontend-ready image URL
    const imageUrl = img
      ? `${req.protocol}://${req.get("host")}/public/uploads/${img}`
      : null;

    res.status(201).json({
      success: true,
      message: "User added",
      userId: result.insertId,
      img: imageUrl, // 👈 FULL URL
    });
  });
};



//  GET ALL USERS
export const getUsers = (req, res) => {
  db.query("SELECT * FROM chatUi ORDER BY id DESC", (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "DB Error",
        error: err.message,
      });
    }

    const usersWithImageUrl = [];

    for (let i = 0; i < result.length; i++) {
      const user = result[i];

      usersWithImageUrl.push({
        ...user,
        img: user.img
          ? `${req.protocol}://${req.get("host")}/public/uploads/${user.img}`
          : null,
      });
    }

    res.status(200).json({
      success: true,
      total: usersWithImageUrl.length,
      users: usersWithImageUrl,
    });
  });
};




