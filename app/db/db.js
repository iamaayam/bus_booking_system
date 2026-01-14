const { Pool } = require('pg');
const pool = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "tooshort",
  database: "bus_booking",
});

module.exports = pool;