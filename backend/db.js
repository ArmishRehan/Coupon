const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const db = pool.promise();

// test connection
db.getConnection()
  .then(() => console.log("MySQL connected successfully!"))
  .catch((err) => console.error("DB connection failed:", err.message));

module.exports = db;
