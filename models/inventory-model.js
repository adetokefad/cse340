const db = require("../database/");

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications() {
  return await db.query(
    "SELECT * FROM public.classification ORDER BY classification_name"
  );
}

/* ***************************
 * Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await db.query(
      `SELECT * FROM public.inventory AS i
      JOIN public.classification AS c
      ON i.classification_id = c.classification_id
      WHERE i.classification_id = $1`,
      [classification_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getclassificationsbyid error " + error);
    return [];
  }
}

async function getInventoryById(inv_id) {
  const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`;
  const result = await db.query(sql, [inv_id]);
  return result.rows[0] || null;
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getInventoryById,
};
