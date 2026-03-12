const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "49.49.197.235",
  database: "postgres",
  password: "Btisadmin",
  port: 5432
});

module.exports = db;
