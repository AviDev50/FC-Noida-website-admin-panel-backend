import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const UPLOAD_DIR = path.join(ROOT, "public", "uploads");
export const RESUME_DIR = path.join(ROOT, "private", "resumes");

export const removeFile = (dir, filename) => {
  if (!filename) return;
  fs.promises.unlink(path.join(dir, path.basename(filename))).catch(() => {});
};

export const imageUrl = (file) =>
  file ? `${process.env.PUBLIC_URL || "http://localhost:3000"}/uploads/${file}` : null;