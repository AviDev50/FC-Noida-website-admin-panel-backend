import db from "../../config/db.js";

// ================= GET ALL CATEGORIES =================
export const getCotegoriesForApi = async (req, res) => {
  try {
    const sql = "SELECT * FROM blog_category ORDER BY category_id DESC";
    const [result] = await db.query(sql);

    return res.status(200).json({
      success: true,
      message: "Categories fetched successfully.",
      result,
    });
  } catch (err) {
    console.error("Get Categories API Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database Error: " + err.message,
    });
  }
};

// ================= GET CAREER JOBS =================
export const getCareerJobs = async (req, res) => {
  try {
    const sql = "SELECT * FROM career_jobs ORDER BY id DESC";
    const [jobs] = await db.query(sql);

    return res.status(200).json({
      success: true,
      message: "Career jobs fetched successfully.",
      data: jobs,
    });
  } catch (err) {
    console.error("Get Career Jobs API Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database Error: " + err.message,
    });
  }
};

// ================= GET ALL EMPLOYEES =================
export const getEmployees = async (req, res) => {
  try {
    const sql = "SELECT * FROM employees ORDER BY created_at DESC";
    const [result] = await db.query(sql);

    // Append full host URL to image filenames
    const employeesWithImageUrl = result.map((emp) => ({
      ...emp,
      image: emp.image
        ? `${req.protocol}://${req.get("host")}/public/uploads/${emp.image}`
        : null,
    }));

    return res.status(200).json({
      success: true,
      message: "Employees fetched successfully.",
      total: employeesWithImageUrl.length,
      data: employeesWithImageUrl,
    });
  } catch (err) {
    console.error("Get Employees API Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database error while fetching employees: " + err.message,
    });
  }
};

// ================= GET BLOGS BY CATEGORY / ALL =================
export const getBlogsByCategory = async (req, res) => {
  try {
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

    if (categoryId) {
      sql += " WHERE blogs.category_id = ?";
      params.push(categoryId);
    }

    sql += " ORDER BY blogs.created_at DESC";

    const [result] = await db.query(sql, params);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No blogs found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Blogs fetched successfully.",
      total: result.length,
      data: result,
    });
  } catch (err) {
    console.error("Get Blogs by Category Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error: " + err.message,
    });
  }
};

// ================= SUBMIT JOB REQUEST =================
export const submitJobRequest = async (req, res) => {
  try {
    const { career_job_id, full_name, email, phone } = req.body;

    if (!full_name || !email || !phone || !req.file) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone, and resume file are required.",
      });
    }

    const resume = req.file.filename;
    const resumeUrl = `${req.protocol}://${req.get("host")}/uploads/${resume}`;

    const sql = `
      INSERT INTO job_requests (career_job_id, full_name, email, phone, resume) 
      VALUES (?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(sql, [
      career_job_id || null,
      full_name,
      email,
      phone,
      resume,
    ]);

    return res.status(201).json({
      success: true,
      message: "Job request submitted successfully.",
      requestId: result.insertId,
      job_id: career_job_id || null,
      resume: resumeUrl,
    });
  } catch (err) {
    console.error("Submit Job Request Error:", err);
    return res.status(500).json({
      success: false,
      message: "Database Error: " + err.message,
    });
  }
};