import db from "../../config/db.js";

// ================= ADD CAREER JOB =================
export async function careerAdd(req, res) {
  try {
    const { job_title, location, job_type, job_description } = req.body;

    if (!job_title || !location || !job_type || !job_description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const sql = `
      INSERT INTO career_jobs 
      (job_title, location, job_type, job_description) 
      VALUES (?, ?, ?, ?)
    `;

    await db.query(sql, [job_title, location, job_type, job_description]);

    return res.redirect("/admin/career");
  } catch (error) {
    console.error("Add Career Job Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
}

// ================= GET ALL CAREER JOBS (EJS VIEW) =================
export const getCareerJobs = async (req, res) => {
  try {
    const sql = "SELECT * FROM career_jobs ORDER BY id DESC";
    const [jobs] = await db.query(sql);

    return res.render("career", {
      title: "Career Opportunities",
      jobs,
    });
  } catch (err) {
    console.error("Get Career Jobs Error:", err);
    return res.status(500).send("Database Error: " + err.message);
  }
};

// ================= DELETE CAREER JOB =================
export const deleteCareerJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const sql = "DELETE FROM career_jobs WHERE id = ?";
    const [result] = await db.query(sql, [jobId]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Job not found");
    }

    return res.redirect("/admin/career");
  } catch (err) {
    console.error("Delete Career Job Error:", err);
    return res.status(500).send("Database Error: Unable to delete job");
  }
};

// ================= SHOW ADD FORM (EJS VIEW) =================
export const showAddCareerForm = (req, res) => {
  return res.render("addCareerJob", { title: "Add New Job" });
};

// ================= SHOW EDIT FORM (EJS VIEW) =================
export const showEditCareerForm = async (req, res) => {
  try {
    const jobId = req.params.id;
    const sql = "SELECT * FROM career_jobs WHERE id = ?";
    const [jobs] = await db.query(sql, [jobId]);

    if (!jobs.length) {
      return res.status(404).send("Job not found");
    }

    return res.render("editCareer", {
      career: jobs[0],
      job: jobs[0],
    });
  } catch (err) {
    console.error("Show Edit Career Form Error:", err);
    return res.status(500).send("Database Error: " + err.message);
  }
};

// ================= UPDATE CAREER JOB =================
export const updateCareerJob = async (req, res) => {
  try {
    const jobId = req.params.id;
    const { job_title, location, job_type, job_description } = req.body;

    const sql =
      "UPDATE career_jobs SET job_title = ?, location = ?, job_type = ?, job_description = ? WHERE id = ?";

    const [result] = await db.query(sql, [
      job_title,
      location,
      job_type,
      job_description,
      jobId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).send("Job not found to update");
    }

    return res.redirect("/admin/career");
  } catch (err) {
    console.error("Update Career Job Error:", err);
    return res.status(500).send("Database Error: " + err.message);
  }
};