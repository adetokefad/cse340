const { Pool } = require("pg");
require("dotenv").config();

/* *******************************
 * Connection Pool
 * Use SSL only in production
 * ******************************* */
let pool;

if (process.env.NODE_ENV === "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  // Added for troubleshooting queries during development
  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        console.log("executed query", { text });
        return res;
      } catch (error) {
        console.error("error in query", { text, error });
        throw error;
      }
    },
  };
} else {
  // production mode
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params);
        return res;
      } catch (error) {
        console.error("DB query error", { text, error });
        throw error;
      }
    },
  };
}
