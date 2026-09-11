import db from "../../config/db.js";

export const getDashboard = (req, res) => {
  try {
    // Employees count
    db.query("SELECT COUNT(*) AS count FROM employees", (err, employeeResult) => {
      if (err)
        return res
          .status(500)
          .send("Employees Query Error: " + err.message);

      // Blogs count
      db.query("SELECT COUNT(*) AS count FROM blogs", (err, blogResult) => {
        if (err)
          return res
            .status(500)
            .send("Blogs Query Error: " + err.message);

        // Enquiries count
        db.query(
          "SELECT COUNT(*) AS count FROM enquiries",
          (err, enquiryResult) => {
            if (err)
              return res
                .status(500)
                .send("Enquiries Query Error: " + err.message);

            // Careers count
            db.query(
              "SELECT COUNT(*) AS count FROM career_jobs",
              (err, careerResult) => {
                if (err)
                  return res
                    .status(500)
                    .send("Careers Query Error: " + err.message);

                // Render dashboard
                res.render("dashboard", {
                  title: "Admin Dashboard",
                  employeeCount: employeeResult[0].count,
                  blogCount: blogResult[0].count,
                  enquiryCount: enquiryResult[0].count,
                  careerCount: careerResult[0].count,
                });
              }
            );
          }
        );
      });
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    res.status(500).send("Server Error");
  }
};
