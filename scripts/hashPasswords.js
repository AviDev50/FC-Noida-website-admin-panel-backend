// scripts/hashPasswords.js
import db from "../config/db.js";
import bcrypt from "bcrypt";

const [users] = await db.query("SELECT id, password FROM auth");
for (const u of users) {
  if (u.password.startsWith("$2")) continue; // already hashed
  const hash = await bcrypt.hash(u.password, 10);
  await db.query("UPDATE auth SET password = ? WHERE id = ?", [hash, u.id]);
}
console.log("Done");
process.exit();