export const authentication = (req, res, next) => {
  if (req.session.admin && req.session.admin.loggedIn) {
    const FIVE_HOURS = 5 * 60 * 60 * 1000;
    const now = Date.now();

    if (now - req.session.admin.loginTime > FIVE_HOURS) {
      // Session expired
      req.session.destroy(() => {
        res.clearCookie("connect.sid");
        return res.redirect("/login");
      });
    } else {
      // Session still valid
      next();
    }
  } else {
    res.redirect("/login");
  }
};

export  default authentication;
