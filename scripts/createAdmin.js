import bcrypt from "bcrypt";
import db from "../config/db.js";

const name = "Admin";
const email = "admin@gmail.com";
const phone = "9999999999";
const password = "FC@123admin";

const hash = await bcrypt.hash(password, 10);

const [existing] = await db.query("SELECT id FROM auth WHERE email = ?", [email]);

if (existing.length) {
  await db.query("UPDATE auth SET password = ? WHERE email = ?", [hash, email]);
  console.log("Admin already tha, password update kar diya.");
} else {
  await db.query(
    "INSERT INTO auth (name, email, phone, password) VALUES (?, ?, ?, ?)",
    [name, email, phone, hash]
  );
  console.log("Admin create ho gaya.");
}

process.exit(0);