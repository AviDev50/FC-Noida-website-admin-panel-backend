// ================= SHOW LOGIN =================
export const showLogin = (req, res) => {
  if (req.session.admin) {
    return res.redirect("/admin/dashboard");
  }

  res.render("login", {
    title: "Admin Login",
    layout: false
  });
};

// ================= LOGIN ADMIN =================
export const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  if (email === "admin@gmail.com" && password === "FC@123admin") {
    // ✅ set session with absolute login time
    req.session.admin = {
      loggedIn: true,
      loginTime: Date.now() // store timestamp
    };
    return res.redirect("/admin/dashboard");
  }

  res.render("login", {
    title: "Admin Login",
    error: "Invalid admin credentials",
    layout: false
  });
};

// ================= LOGOUT ADMIN =================
export const logoutAdmin = (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
};