const { Pool } = require("pg");

const db = new Pool({
  user: "postgres",
  host: "49.49.195.91",
  database: "postgres",
  password: "Btisadmin",
  port: 5432
});

module.exports = db;
