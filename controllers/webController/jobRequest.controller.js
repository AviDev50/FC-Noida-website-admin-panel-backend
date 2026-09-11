import db from "../../config/db.js";
import fs from "fs";
import path from "path";

export const showJobRequestsForm = (req, res) => {
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

  db.query(sql, (err, result) => {
    if (err) {
      console.error("SQL ERROR:", err.sqlMessage);
      return res.status(500).send(err.sqlMessage);
    }

    res.render("jobRequest", {
      title: "Job Requests",
      requests: result || [],
    });
  });
};


/* ================= DELETE JOB REQUEST ================= */


export const deleteJobRequest = (req, res) => {
  const job_request_id = req.params.job_request_id;
  

  db.query(
    "SELECT resume FROM job_requests WHERE job_request_id = ?",
    [job_request_id],
    (err, result) => {
      if (err || result.length === 0) {
        return res.status(404).send("Request not found");
      }

      const resumeFile = result[0].resume;

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

      db.query(
        "DELETE FROM job_requests WHERE job_request_id = ?",
        [job_request_id],
        (err2) => {
          if (err2) return res.status(500).send("Delete failed");

          res.redirect("/admin/jobRequest");
        }
      );
    }
  );
};