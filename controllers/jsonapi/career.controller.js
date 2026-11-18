import db from "../../config/db.js";
import { buildUpdate, pickDefined, emptyToNull, getPagination, paginated } from "../../utils/db.js";
import { bad, isStr } from "../../utils/validate.js";

export const getCareerJobs = async (req, res, next) => {
  try {
    const pg = getPagination(req.query, 20);
    const [[{ total }]] = await db.query("SELECT COUNT(*) AS total FROM career_jobs");
    const [rows] = await db.query("SELECT * FROM career_jobs ORDER BY id DESC LIMIT ? OFFSET ?", [pg.limit, pg.offset]);
    res.json(paginated(rows, total, pg));
  } catch (e) { next(e); }
};

export const careerAdd = async (req, res, next) => {
  try {
    const { job_title, location, job_type, job_description } = req.body;
    if (!isStr(job_title) || !isStr(location) || !isStr(job_type)) {
      return bad(res, "job_title, location, and job_type are required.");
    }
    const [result] = await db.query(
      "INSERT INTO career_jobs (job_title, location, job_type, job_description) VALUES (?, ?, ?, ?)",
      [job_title.trim(), location.trim(), job_type.trim(), emptyToNull(job_description) ?? null]
    );
    res.status(201).json({ success: true, message: "Job created successfully.", jobId: result.insertId });
  } catch (e) { next(e); }
};

export const updateCareerJob = async (req, res, next) => {
  try {
    const data = pickDefined(req.body, ["job_title", "location", "job_type", "job_description"]);
    for (const k of ["job_title", "location", "job_type"]) {
      if (k in data && !isStr(data[k])) return bad(res, `${k} cannot be empty.`);
    }
    if ("job_description" in data) data.job_description = emptyToNull(data.job_description);
    if (!Object.keys(data).length) return bad(res, "Nothing to update.");

    const [sql, params] = buildUpdate("career_jobs", "id", req.params.id, data);
    const [result] = await db.query(sql, params);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Job not found." });
    res.json({ success: true, message: "Job updated successfully." });
  } catch (e) { next(e); }
};

export const deleteCareerJob = async (req, res, next) => {
  try {
    const [result] = await db.query("DELETE FROM career_jobs WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: "Job not found." });
    res.json({ success: true, message: "Job deleted successfully." });
  } catch (e) { next(e); }
};