const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

const invController = {};

/* ************************
 * Build inventory by classification view
 * ************************ */
invController.buildByClassificationId = async function (req, res, next) {
  try {
    const rawId = req.params.classificationId;
    const classification_id = parseInt(rawId, 10);

    if (isNaN(classification_id)) {
      console.error("Invalid classification ID:", rawId);
      return res.status(400).render("error", {
        message: "Invalid classification ID",
      });
    }

    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );

    if (!data || data.length === 0) {
      return res.status(404).render("error", {
        message: "No vehicles found for this classification",
      });
    }

    const grid = await utilities.buildClassificationGrid(data);
    const nav = await utilities.getNav();
    const className = data[0].classification_name;

    res.render("./inventory/classification", {
      title: `${className} vehicles`,
      nav,
      grid,
    });
  } catch (error) {
    console.error("Error in buildByClassificationId:", error);
    next(error);
  }
};

/* ************************
 * Build vehicle detail view by inventory ID
 * ************************ */
invController.buildByInventoryId = async function (req, res, next) {
  try {
    const rawId = req.params.invId;
    const invId = parseInt(rawId, 10);

    if (isNaN(invId)) {
      console.error("Invalid inventory ID:", rawId);
      return res.status(400).render("error", {
        message: "Invalid inventory ID",
      });
    }

    // Call the model
    const data = await invModel.getInventoryById(invId);

    // Handle if model returns array or single object
    const vehicle = Array.isArray(data) ? data[0] : data;

    if (!vehicle) {
      return res.status(404).render("error", {
        message: "Vehicle not found",
      });
    }

    if (vehicle.inv_image && !vehicle.inv_image.startsWith("/")) {
      vehicle.inv_image = "/" + vehicle.inv_image.replace("public/", "");
    }

    const nav = await utilities.getNav();

    res.render("inventory/detail", {
      title: `${vehicle.inv_make} ${vehicle.inv_model}`,
      nav,
      vehicle,
    });
  } catch (error) {
    console.error("Error in buildByInventoryId:", error);
    next(error);
  }
};

module.exports = invController;
