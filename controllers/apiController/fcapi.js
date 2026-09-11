import db from "../../config/db.js";

// Get category

export const getCotegoriesForApi = (req, res) => {
  const sql = "SELECT * FROM blog_category";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).send("Database Error: " + err.message);
    }

    return res.status(202).json({
      message: "category get successfull",
      result,
    });
  });
};

// get CareerJobs

export const getCareerJobs = (req, res) => {
  const sql = "SELECT * FROM career_jobs ORDER BY id DESC";

  db.query(sql, (err, jobs) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database Error",
        error: err,
      });
    }
    res.status(200).json({
      success: true,
      message: "Career jobs fetched successfully",
      data: jobs,
    });
  });
};


// GET all employees
export const getEmployees = (req, res) => {
  const sql = "SELECT * FROM employees ORDER BY created_at DESC";

  db.query(sql, (err, result) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Database error while fetching employees",
        error: err.message,
      });
    }

    // IMAGE NAME → FULL URL
    const employeesWithImageUrl = result.map(emp => ({
      ...emp,
      image: emp.image
        ? `${req.protocol}://${req.get("host")}/public/uploads/${emp.image}`
        : null
    }));

    res.status(200).json({
      success: true,
      message: "Employees fetched successfully",
      total: employeesWithImageUrl.length,
      data: employeesWithImageUrl,
    });
  });
};


// Get blogs by category_id
export const getBlogsByCategory = (req, res) => {
  const categoryId = req.query.category_id;

let sql = `
  SELECT 
    blogs.*,
    blog_category.category_name,
    blog_category.category_id

  FROM blogs
  LEFT JOIN blog_category
    ON blogs.category_id = blog_category.category_id
`;
  const params = [];

  // If categoryId is provided, filter by category
  if (categoryId) {
    sql += " WHERE blogs.category_id = ?";
    params.push(categoryId);
  }

  sql += " ORDER BY blogs.created_at DESC";

  db.query(sql, params, (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Blogs fetched successfully",
      total: result.length,
      data: result,
    });
  }); 
}; 



/* ================= SUBMIT JOB REQUEST================= */
export const submitJobRequest = (req, res) => {
  const { career_job_id,full_name, email, phone } = req.body;

  if (!full_name || !email || !phone || !req.file) {
    return res.status(400).json({ message: "All fields required" });
  }

  const resume = req.file.filename;

  const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/${resume}`;

  const sql =
    "INSERT INTO job_requests (career_job_id,full_name, email, phone, resume) VALUES (?, ?, ?, ?,?)";

  db.query(sql, [career_job_id,full_name, email, phone, resume], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Database Error",
      });
    }

    res.status(201).json({
      success: true,
      message: "Job request submitted",
      requestId: result.insertId,
      job_id:career_job_id,
      resume: resumeUrl
    });
  });
};


