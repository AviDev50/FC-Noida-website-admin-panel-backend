export const showLogin = (req, res) => {
  res.render("login", { title: "Admin Login", layout: false });
};

export const loginAdmin = (req, res) => {
  const { email, password } = req.body;

  // Dummy credentials check
  if (email === "admin@gmail.com" && password === "1234") {
    req.session.admin = true;        // session set
    return res.redirect("/admin/dashboard");
  }

  res.redirect("/login");             // invalid, back to login
};

export const logoutAdmin = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");           // logout, destroy session
  });
};
