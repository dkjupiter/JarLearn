const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "223.205.65.239",
  database: "postgres",
  password: "Btisadmin",
  port: 5432
});

module.exports = db;
