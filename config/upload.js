import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const makeUpload = (dir, allowed, maxMB) => {
  fs.mkdirSync(dir, { recursive: true });

  return multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      filename: (req, file, cb) =>
        cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`),
    }),
    limits: { fileSize: maxMB * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const ok = allowed[file.mimetype]?.includes(ext);
      if (ok) return cb(null, true);
      const err = new Error("Invalid file type");
      err.status = 400;
      cb(err);
    },
  });
};

// Public (served via /uploads)
export const uploadImage = makeUpload(
  "public/uploads",
  { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] },
  2
);

// Private (served only via admin route)
export const uploadResume = makeUpload(
  "private/resumes",
  {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  },
  5
);