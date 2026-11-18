import db from "../../config/db.js";
import bcrypt from "bcrypt";

// ================= SHOW LOGIN (EJS VIEW) =================
export const showLogin = (req, res) => {
  if (req.session && req.session.admin) {
    return res.redirect("/admin/dashboard");
  }

  return res.render("login", {
    title: "Admin Login",
    error: null,
    layout: false
  });
};

// ================= LOGIN ADMIN (FORM SUBMIT) =================
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.render("login", {
        title: "Admin Login",
        error: "Email and password are required.",
        layout: false
      });
    }

    // 1. Fetch admin record from database (auth table)
    const [users] = await db.query(
      "SELECT id, name, email, password FROM auth WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.render("login", {
        title: "Admin Login",
        error: "Invalid admin credentials.",
        layout: false
      });
    }

    const admin = users[0];

    // 2. Validate password (supports both plain-text & bcrypt hash)
    const isMatch =
      password === admin.password ||
      (await bcrypt.compare(password, admin.password).catch(() => false));

    if (!isMatch) {
      return res.render("login", {
        title: "Admin Login",
        error: "Invalid admin credentials.",
        layout: false
      });
    }

    // 3. Set session with timestamp for expiry check
    req.session.admin = {
      loggedIn: true,
      id: admin.id,
      name: admin.name,
      email: admin.email,
      loginTime: Date.now()
    };

    return res.redirect("/admin/dashboard");
  } catch (err) {
    console.error("Login Admin Error:", err);
    return res.render("login", {
      title: "Admin Login",
      error: "An unexpected error occurred. Please try again.",
      layout: false
    });
  }
};

// ================= LOGOUT ADMIN =================
export const logoutAdmin = (req, res) => {
  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout Error:", err);
      }
      res.clearCookie("connect.sid");
      return res.redirect("/login");
    });
  } else {
    return res.redirect("/login");
  }
};