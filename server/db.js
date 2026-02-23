const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "223.204.95.95",
  database: "postgres",
  password: "Btisadmin",
  port: 5432
});

module.exports = db;
