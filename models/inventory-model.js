const db = require("../database");

async function getClassifications() {
  try {
    return await db.query(
      "SELECT * FROM public.classification ORDER BY classification_name",
    );
  } catch (error) {
    console.error("getClassifications error:", error);
    throw error;
  }
}

async function getInventoryByClassificationId(classification_id) {
  try {
    return await db.query(
      "SELECT * FROM public.inventory WHERE classification_id = $1",
      [classification_id],
    );
  } catch (error) {
    console.error("getInventoryByClassificationId error:", error);
    throw error;
  }
}

async function getVehicleById(inv_id) {
  try {
    return await db.query("SELECT * FROM public.inventory WHERE inv_id = $1", [
      inv_id,
    ]);
  } catch (error) {
    console.error("getVehicleById error:", error);
    throw error;
  }
}

module.exports = {
  getClassifications,
  getInventoryByClassificationId,
  getVehicleById,
};
