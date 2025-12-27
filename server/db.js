const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "223.205.68.9",
  database: "postgres",
  password: "Btisadmin",
  port: 5432
});

module.exports = db;
