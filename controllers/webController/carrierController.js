import db from "../../config/db.js";

export async function careerAdd(req, res) {
  try {
    const { job_title, location, job_type, job_description } = req.body;
    // console.log(req.body)

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

    db.query(
      sql,
      [job_title, location, job_type, job_description],
      (err, result) => {
        if (err) {
          return res.status(500).json({
            success: false,
            message: "Something went wrong",
            error: err.message,
          });
        }

    

        res.redirect("/admin/career");
      }
    );
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// GET Career
export const getCareerJobs = (req, res) => {
  const sql = "SELECT * FROM career_jobs ORDER BY id DESC";

  db.query(sql, (err, jobs) => {
    if (err) {
      return res.status(500).send("Database Error");
    }

    
    res.render("career", {
      title: "Career Opportunities",
      jobs,
    });


  });
};





//delete

export const deleteCareerJob = (req, res) => {
  const jobId = req.params.id;

  const sql = "DELETE FROM career_jobs WHERE id=?";
  db.query(sql, [jobId], (err, result) => {
    if (err)
      return res.status(500).send("Database Error: Unable to delete job");

    // Redirect to career page to fetch updated jobs
    res.redirect("/admin/career");
  });
};




// Show add Career job form
export const showAddCareerForm = (req, res) => {
  res.render("addCareerJob", { title: "Add New Job" });
};




// show edit form

export const showEditCareerForm = (req, res) => {
  const jobId = req.params.id;
    
  const sql = "SELECT * FROM career_jobs WHERE id = ?";
  db.query(sql, [jobId], (err, jobs) => {
    if (err) return res.status(500).send("Database Error");
        // console.log("Query result:", jobs);
    if (!jobs.length) return res.status(404).send("Job not found");

    res.render("editCareer", {
      career: jobs[0], 
      job: jobs[0],
    });
  });
};




//update
export const updateCareerJob = (req, res) => {
  const jobId = req.params.id;
  const { job_title, location, job_type, job_description } = req.body;

  const sql =
    "UPDATE career_jobs SET job_title=?, location=?, job_type=?, job_description=? WHERE id=?";

  db.query(
    sql,
    [job_title, location, job_type, job_description, jobId],
    (err) => {
      if (err) return res.status(500).send("Database Error");
      res.redirect("/admin/career");
     
    


    }
  );
};