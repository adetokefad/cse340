const utilities = require("../utilities");
const invModel = require("../models/inventory-model");

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data =
      await invModel.getInventoryByClassificationId(classification_id);
    const nav = await utilities.getNav();
    const className = data.rows[0]?.classification_id
      ? (await invModel.getClassifications()).rows.find(
          (row) => row.classification_id == classification_id,
        )?.classification_name || "Unknown"
      : "No vehicles";
    res.render("inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      vehicles: data.rows,
      classification_id,
    });
  } catch (error) {
    next({
      status: 500,
      message: "Error rendering classification view: " + error.message,
    });
  }
};

invCont.buildVehicleDetail = async function (req, res, next) {
  try {
    const inv_id = req.params.inv_id;
    const data = await invModel.getVehicleById(inv_id);
    const nav = await utilities.getNav();
    if (data.rows.length === 0) {
      return next({ status: 404, message: "Vehicle not found." });
    }
    const vehicle = data.rows[0];
    const vehicleHTML = await utilities.buildVehicleHTML(vehicle);
    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicleHTML,
      vehicle,
    });
  } catch (error) {
    next({
      status: 500,
      message: "Error rendering vehicle detail: " + error.message,
    });
  }
};

module.exports = invCont;
