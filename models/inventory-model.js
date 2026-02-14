const pool = require("../database"); // Match server.js import

async function getInventoryByClassificationId(classification_id) {
  try {
    const result = await pool.query(
      "SELECT * FROM public.inventory WHERE classification_id = $1",
      [classification_id],
    );
    return result.rows;
  } catch (error) {
    console.error("Error in getInventoryByClassificationId:", error);
    throw error;
  }
}

async function getVehicleById(inv_id) {
  try {
    return await pool.query(
      "SELECT * FROM public.inventory WHERE inv_id = $1",
      [inv_id],
    );
  } catch (error) {
    console.error("getVehicleById error:", error);
    throw error;
  }
}

async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *";
    const result = await pool.query(sql, [classification_name]);
    return result.rows[0];
  } catch (error) {
    console.error("addClassification error:", error);
    throw error;
  }
}

async function getClassifications() {
  try {
    const sql =
      "SELECT * FROM public.classification ORDER BY classification_name";
    const result = await pool.query(sql);
    return result;
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
}

async function addInventory(
  classification_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
) {
  try {
    const sql = `
      INSERT INTO public.inventory (
        classification_id, inv_make, inv_model, inv_description, inv_image,
        inv_thumbnail, inv_price, inv_year, inv_miles, inv_color
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *
    `;
    const result = await pool.query(sql, [
      classification_id,
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_year,
      inv_miles,
      inv_color,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error("addInventory error:", error);
    throw error;
  }
}

/* ***************************
 * Get Inventory Item by Inventory ID
 * ************************** */
async function getInventoryById(inv_id) {
  try {
    const sql = "SELECT * FROM public.inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data.rows;
  } catch (error) {
    throw new Error("Error fetching inventory by ID: " + error.message);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
  inv_id,
  inv_make,
  inv_model,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_year,
  inv_miles,
  inv_color,
  classification_id,
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *";
    const data = await pool.query(sql, [
      inv_make,
      inv_model,
      inv_description,
      inv_image,
      inv_thumbnail,
      Number(inv_price),
      Number(inv_year),
      Number(inv_miles),
      inv_color,
      Number(classification_id),
      Number(inv_id),
    ]);
    return data.rows[0];
  } catch (error) {
    console.error("model error: " + error);
    return null;
  }
}

/* ***************************
 * Delete Inventory Item
 * ************************** */
async function executeDelete(inv_id) {
  try {
    const sql = "DELETE FROM inventory WHERE inv_id = $1";
    const data = await pool.query(sql, [inv_id]);
    return data.rowCount;
  } catch (error) {
    throw new Error("Delete Inventory Error");
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
  addClassification,
  addInventory,
  getInventoryById,
  executeDelete,
  updateInventory,
};
