import db from "../../config/db.js";

export const getDashboard = async (req, res, next) => {
  try {
    const [[row]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM employees)    AS employees,
        (SELECT COUNT(*) FROM blogs)        AS blogs,
        (SELECT COUNT(*) FROM enquiries)    AS enquiries,
        (SELECT COUNT(*) FROM career_jobs)  AS careerJobs,
        (SELECT COUNT(*) FROM job_requests) AS jobRequests
    `);
    res.json({ success: true, message: "Dashboard stats fetched successfully", data: row });
  } catch (e) { next(e); }
};