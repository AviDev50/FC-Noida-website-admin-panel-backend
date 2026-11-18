import db from "../../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/env.js";

// POST: /api/login
export const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are both required." });
    }

    const [users] = await db.query("SELECT * FROM auth WHERE email = ?", [email]);
    const user = users[0];

    // user na mile tab bhi compare chalao (timing attack se bachne ke liye)
    const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.4j1k8l7y5yJ1p3k0y2m7m8m9m0mO";
    const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH).catch(() => false);

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { algorithm: "HS256", expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      admin: { id: user.id, name: user.name, email: user.email, phone: user.phone },
    });
  } catch (error) {
    next(error);
  }
};

// POST: /api/admin/logout
export const logoutAdmin = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logout successful. Please remove token from the client side.",
  });
};