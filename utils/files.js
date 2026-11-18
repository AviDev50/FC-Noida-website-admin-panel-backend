import fs from "fs";
import path from "path";

export const UPLOAD_DIR = "public/uploads";
export const RESUME_DIR = "private/resumes";

export const removeFile = (dir, filename) => {
  if (!filename) return;
  fs.promises.unlink(path.resolve(dir, path.basename(filename))).catch(() => {});
};