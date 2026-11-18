

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "shiv_dev",
//   password: "ii#3aQ708",
//   database: "atulserver_fcnoidawebsite",
// });

// import mysql from "mysql2";

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "rootmish@2025",
//   database: "fcnoidawebsite",
// });

// db.connect((err) => {
//   if (err) throw err;
//   console.log("MySQL connected...");
// });

// export default db;


import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "rootmish@2025",
  database: "fcnoidawebsite",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Initial connection test
db.getConnection()
  .then((conn) => {
    console.log("MySQL connected (Promise Pool)...");
    conn.release();
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);
  });

export default db;