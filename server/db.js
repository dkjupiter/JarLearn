const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "223.204.90.245",
  database: "postgres",
  password: "Btisadmin",
  port: 5432
});

module.exports = db;
