const { Pool } = require("pg");
require("dotenv").config();

const isDev = process.env.NODE_ENV === "development";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isDev ? { rejectUnauthorized: false } : undefined,
});

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params);
      if (isDev) {
        console.log("executed query", { text });
      }
      return res;
    } catch (error) {
      console.error("DB query error", { text, error });
      throw error;
    }
  },
};
