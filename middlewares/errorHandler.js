import multer from "multer";

export const notFound = (req, res) =>
  res.status(404).json({ success: false, message: "Route not found" });

export const errorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File too large" : err.message;
    return res.status(400).json({ success: false, message });
  }
  if (err.type === "entity.too.large") {
    return res.status(413).json({ success: false, message: "Payload too large" });
  }
  if (err.code === "ER_DUP_ENTRY") {
    return res.status(409).json({ success: false, message: "Duplicate entry" });
  }
  if (err.code === "ER_NO_REFERENCED_ROW_2") {
  return res.status(400).json({ success: false, message: "Invalid reference (related record not found)" });
}
if (err.code === "ER_ROW_IS_REFERENCED_2") {
  return res.status(409).json({ success: false, message: "Record is in use and cannot be deleted" });
}
  if (err.status && err.status < 500) {
    return res.status(err.status).json({ success: false, message: err.message });
  }
  console.error(err);
  res.status(500).json({ success: false, message: "Internal server error" });
};