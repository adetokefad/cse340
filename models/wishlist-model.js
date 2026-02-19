const pool = require("../database/");

async function addToWishlist(account_id, inv_id) {
  try {
    const sql =
      "INSERT INTO wishlist (account_id, inv_id) VALUES ($1, $2) ON CONFLICT (account_id, inv_id) DO NOTHING RETURNING *";
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows[0];
  } catch (err) {
    throw new Error("Error adding to wishlist: " + err.message);
  }
}

async function removeFromWishlist(account_id, inv_id) {
  try {
    const sql =
      "DELETE FROM wishlist WHERE account_id = $1 AND inv_id = $2 RETURNING *";
    const data = await pool.query(sql, [account_id, inv_id]);
    return data.rows[0];
  } catch (err) {
    throw new Error("Error removing from wishlist: " + err.message);
  }
}

async function getWishlistByAccount(account_id) {
  try {
    const sql = `
      SELECT w.wishlist_id, i.inv_id, i.inv_make, i.inv_model, i.inv_year, i.inv_price
      FROM wishlist w
      JOIN inventory i ON w.inv_id = i.inv_id
      WHERE w.account_id = $1
      ORDER BY w.date_added DESC
    `;
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (err) {
    throw new Error("Error fetching wishlist: " + err.message);
  }
}

async function clearWishlistByAccount(account_id) {
  try {
    const sql = "DELETE FROM wishlist WHERE account_id = $1";
    await pool.query(sql, [account_id]);
    return true;
  } catch (err) {
    throw new Error("Error clearing wishlist: " + err.message);
  }
}

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlistByAccount,
  clearWishlistByAccount,
};
