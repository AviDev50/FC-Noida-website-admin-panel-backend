

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "shiv_dev",
//   password: "ii#3aQ708",
//   database: "atulserver_fcnoidawebsite",
// });

import mysql from "mysql2";

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "rootmish@2025",
  database: "fcnoidawebsite",
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL connected...");
});

export default db;
