import path from "path";
import db from "../../config/db.js";
import { getPagination, paginated } from "../../utils/db.js";
import { removeFile, RESUME_DIR } from "../../utils/files.js";
import { bad, isEmail, isPhone, isStr } from "../../utils/validate.js";

const countAndList = async (table, orderCol, req, res, selectSql) => {
  const pg = getPagination(req.query);
  const [[{ total }]] = await db.query(`SELECT COUNT(*) AS total FROM ${table}`);
  const [rows] = await db.query(`${selectSql} ORDER BY ${orderCol} DESC LIMIT ? OFFSET ?`, [pg.limit, pg.offset]);
  res.json(paginated(rows, total, pg));
};

// ---------- General Enquiries ----------
export const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!isStr(name, 100)) return bad(res, "Valid name is required.");
    if (!isEmail(email)) return bad(res, "Valid email is required.");
    if (!isPhone(phone)) return bad(res, "Valid phone is required.");
    if (!isStr(message, 5000)) return bad(res, "Message is required.");
    if (subject !== undefined && subject !== null && typeof subject !== "string") return bad(res, "Invalid subject.");

    const [result] = await db.query(
      "INSERT INTO enquiries (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), email.trim(), phone.trim(), subject?.slice(0, 255) ?? null, message.trim()]
    );
    res.status(201).json({ success: true, message: "Enquiry submitted successfully.", enquiryId: result.insertId });
  } catch (e) { next(e); }
};

export const getEnquiries = async (req, res, next) => {
  try { await countAndList("enquiries", "id", req, res, "SELECT * FROM enquiries"); }
  catch (e) { next(e); }
};

export const deleteEnquiries = async (req, res, next) => {
  try {
    const [result] = await db.query("DELETE FROM enquiries WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Enquiry not found." });
    res.json({ success: true, message: "Enquiry deleted successfully." });
  } catch (e) { next(e); }
};

// ---------- Job Requests ----------
export const submitJobRequest = async (req, res, next) => {
  const resume = req.file?.filename ?? null;
  try {
    const { full_name, email, phone, career_job_id } = req.body;
    if (!resume) return bad(res, "Resume upload is required.");

    if (!isStr(full_name, 100) || !isEmail(email) || !isPhone(phone)) {
      removeFile(RESUME_DIR, resume);
      return bad(res, "Valid full_name, email and phone are required.");
    }

    const [result] = await db.query(
      "INSERT INTO job_requests (full_name, email, phone, resume, career_job_id) VALUES (?, ?, ?, ?, ?)",
      [full_name.trim(), email.trim(), phone.trim(), resume, career_job_id || null]
    );
    res.status(201).json({ success: true, message: "Job application submitted successfully.", id: result.insertId });
  } catch (e) {
    removeFile(RESUME_DIR, resume);
    next(e); // invalid career_job_id => handler me 400
  }
};

export const showJobRequestsForm = async (req, res, next) => {
  try {
    await countAndList(
      "job_requests", "jr.job_request_id", req, res,
      `SELECT jr.*, cj.job_title FROM job_requests jr
       LEFT JOIN career_jobs cj ON jr.career_job_id = cj.id`
    );
  } catch (e) { next(e); }
};

export const downloadResume = async (req, res, next) => {
  try {
    const [rows] = await db.query("SELECT resume FROM job_requests WHERE job_request_id = ?", [req.params.job_request_id]);
    if (!rows.length || !rows[0].resume) return res.status(404).json({ success: false, message: "Resume not found" });
    res.download(path.resolve(RESUME_DIR, path.basename(rows[0].resume)), (err) => {
      if (err && !res.headersSent) res.status(404).json({ success: false, message: "File missing on server" });
    });
  } catch (e) { next(e); }
};

export const deleteJobRequest = async (req, res, next) => {
  try {
    const { job_request_id } = req.params;
    const [[row]] = await db.query("SELECT resume FROM job_requests WHERE job_request_id = ?", [job_request_id]);
    if (!row) return res.status(404).json({ success: false, message: "Job request not found." });

    await db.query("DELETE FROM job_requests WHERE job_request_id = ?", [job_request_id]);
    removeFile(RESUME_DIR, row.resume);
    res.json({ success: true, message: "Job request deleted successfully." });
  } catch (e) { next(e); }
};

// ---------- School Inquiries ----------
// Table ko pehle DB me lowercase rename karo: RENAME TABLE School_inquiries TO school_inquiries;
export const createSchoolUser = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    if (!isStr(name, 100) || !isEmail(email) || !isPhone(phone)) return bad(res, "Valid name, email and phone are required.");

    const [result] = await db.query(
      "INSERT INTO school_inquiries (name, email, phone) VALUES (?, ?, ?)",
      [name.trim(), email.trim(), phone.trim()]
    );
    res.status(201).json({ success: true, message: "School inquiry created successfully.", id: result.insertId });
  } catch (e) { next(e); }
};

export const getSchoolUsers = async (req, res, next) => {
  try { await countAndList("school_inquiries", "id", req, res, "SELECT * FROM school_inquiries"); }
  catch (e) { next(e); }
};

export const deleteSchoolEnquiry = async (req, res, next) => {
  try {
    const [result] = await db.query("DELETE FROM school_inquiries WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "School inquiry not found." });
    res.json({ success: true, message: "School inquiry deleted successfully." });
  } catch (e) { next(e); }
};