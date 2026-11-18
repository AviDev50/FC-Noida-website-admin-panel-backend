import db from "../../config/db.js";
import fs from "fs";
import path from "path";

/* ================= SHOW JOB REQUESTS (EJS VIEW) ================= */
export const showJobRequestsForm = async (req, res) => {
  try {
    const sql = `
      SELECT 
        jr.job_request_id,
        jr.full_name,
        jr.email,
        jr.phone,
        jr.resume,
        jr.created_at,
        cj.job_title
      FROM job_requests jr
      LEFT JOIN career_jobs cj
        ON jr.career_job_id = cj.id
      ORDER BY jr.job_request_id DESC
    `;

    const [requests] = await db.query(sql);

    return res.render("jobRequest", {
      title: "Job Requests",
      requests: requests || [],
    });
  } catch (err) {
    console.error("Job Requests View Error:", err);
    return res.status(500).send("Database Error: " + err.message);
  }
};

/* ================= DELETE JOB REQUEST ================= */
export const deleteJobRequest = async (req, res) => {
  try {
    const { job_request_id } = req.params;

    // 1. Fetch file name before deleting row
    const [records] = await db.query(
      "SELECT resume FROM job_requests WHERE job_request_id = ?",
      [job_request_id]
    );

    if (records.length === 0) {
      return res.status(404).send("Request not found");
    }

    const resumeFile = records[0].resume;

    // 2. Remove file from storage if it exists
    if (resumeFile) {
      const filePath = path.join(
        process.cwd(),
        "public",
        "uploads",
        resumeFile
      );

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // 3. Delete record from database
    await db.query("DELETE FROM job_requests WHERE job_request_id = ?", [
      job_request_id,
    ]);

    return res.redirect("/admin/jobRequest");
  } catch (err) {
    console.error("Delete Job Request Error:", err);
    return res.status(500).send("Delete failed: " + err.message);
  }
};