import db from "../../config/db.js";

export const getDashboard = async (req, res) => {
  try {
    // Sabhi count queries ko Promise.all ke through parallel execute karein
    const [
      [[employeeRow]],
      [[blogRow]],
      [[enquiryRow]],
      [[careerRow]]
    ] = await Promise.all([
      db.query("SELECT COUNT(*) AS count FROM employees"),
      db.query("SELECT COUNT(*) AS count FROM blogs"),
      db.query("SELECT COUNT(*) AS count FROM enquiries"),
      db.query("SELECT COUNT(*) AS count FROM career_jobs")
    ]);

    // Render dashboard view
    return res.render("dashboard", {
      title: "Admin Dashboard",
      employeeCount: employeeRow?.count || 0,
      blogCount: blogRow?.count || 0,
      enquiryCount: enquiryRow?.count || 0,
      careerCount: careerRow?.count || 0,
    });
  } catch (error) {
    console.error("Dashboard Controller Error:", error);
    return res.status(500).send("Dashboard Error: " + error.message);
  }
};