import db from "../../config/db.js";
import { getPagination, paginated } from "../../utils/db.js";
import { bad, isEmail, isPhone, isStr } from "../../utils/validate.js";

// ---------- PUBLIC ----------
export const createPgDemoRequest = async (req, res, next) => {
  try {
    const { full_name, property_name, email_address, phone_number, number_of_rooms, special_requests } = req.body;

    if (!isStr(full_name, 150)) return bad(res, "Valid full_name is required.");
    if (!isStr(property_name, 150)) return bad(res, "Valid property_name is required.");
    if (!isEmail(email_address)) return bad(res, "Valid email_address is required.");
    if (!isPhone(phone_number)) return bad(res, "Valid phone_number is required.");

    const rooms =
      number_of_rooms === undefined || number_of_rooms === null || String(number_of_rooms).trim() === ""
        ? null
        : String(number_of_rooms).trim();
    if (rooms && rooms.length > 50) return bad(res, "number_of_rooms is too long.");

    const requests =
      typeof special_requests === "string" && special_requests.trim() !== "" ? special_requests.trim() : null;
    if (requests && requests.length > 3000) return bad(res, "special_requests is too long.");

    const [result] = await db.query(
      `INSERT INTO pg_book_demo_requests
         (full_name, property_name, email_address, phone_number, number_of_rooms, special_requests)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), property_name.trim(), email_address.trim(), phone_number.trim(), rooms, requests]
    );

    res.status(201).json({ success: true, message: "Demo request submitted successfully.", id: result.insertId });
  } catch (e) { next(e); }
};

// ---------- ADMIN ----------
// GET /api/admin/pg-demo-requests?page=&limit=
export const getPgDemoRequests = async (req, res, next) => {
  try {
    const pg = getPagination(req.query);
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM pg_book_demo_requests WHERE deleted_at IS NULL"
    );
    const [rows] = await db.query(
      `SELECT demo_id, full_name, property_name, email_address, phone_number,
              number_of_rooms, special_requests, created_at
       FROM pg_book_demo_requests
       WHERE deleted_at IS NULL
       ORDER BY demo_id DESC LIMIT ? OFFSET ?`,
      [pg.limit, pg.offset]
    );
    res.json(paginated(rows, total, pg));
  } catch (e) { next(e); }
};

// DELETE /api/admin/pg-demo-requests/:id  (soft delete)
export const deletePgDemoRequest = async (req, res, next) => {
  try {
    const [result] = await db.query(
      "UPDATE pg_book_demo_requests SET deleted_at = NOW() WHERE demo_id = ? AND deleted_at IS NULL",
      [req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: "Demo request not found." });
    }
    res.json({ success: true, message: "Demo request deleted successfully." });
  } catch (e) { next(e); }
};