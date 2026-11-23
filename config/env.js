// config/env.js
import "dotenv/config";

const required = ["JWT_SECRET", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "FRONTEND_URL"];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing env: ${key}`);
}

export const JWT_SECRET = process.env.JWT_SECRET;
export const PORT = process.env.PORT || 8000;
export const FRONTEND_URLS = process.env.FRONTEND_URL.split(",").map((s) => s.trim());