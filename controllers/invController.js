const utilities = require("../utilities");
const invModel = require("../models/inventory-model");

const invCont = {};

invCont.buildByClassificationId = async function (req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const id = parseInt(classification_id, 10);
    if (isNaN(id)) {
      throw new Error("Invalid classification ID");
    }
    const data = await invModel.getInventoryByClassificationId(id);
    const nav = await utilities.getNav();
    let className = "No vehicles";
    if (data && data.length > 0) {
      className =
        (await invModel.getClassifications()).rows.find(
          (row) => row.classification_id === id,
        )?.classification_name || "Unknown";
    }
    res.render("inventory/classification", {
      title: `${className} Vehicles`,
      nav,
      vehicles: data || [],
      classification_id: id,
    });
  } catch (error) {
    next({
      status: 400,
      message: `Error rendering classification view: ${error.message}`,
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

invCont.buildManagement = async function (req, res, next) {
  let nav = await utilities.getNav();
  const classificationSelect = await utilities.buildClassificationList();
  res.render("./inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
  });
};

async function buildAddClassification(req, res, next) {
  let nav = await utilities.getNav();
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    errors: null,
    messages: req.flash(),
  });
}

async function addClassification(req, res, next) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  try {
    const result = await invModel.addClassification(classification_name);
    if (result) {
      req.flash("success", "Classification added successfully!");
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
      });
    }
  } catch (error) {
    req.flash("error", "Error adding classification. Try again.");
    res.render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
      messages: req.flash(),
    });
  }
}

async function buildAddInventory(req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    nav,
    classificationList,
    errors: null,
    messages: req.flash(),
  });
}

async function addInventory(req, res, next) {
  let nav = await utilities.getNav();
  let {
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
  } = req.body;
  try {
    const result = await invModel.addInventory(
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
    );
    if (result) {
      req.flash("success", "Inventory added successfully!");
      res.render("inventory/management", {
        title: "Inventory Management",
        nav,
        messages: req.flash(),
      });
    }
  } catch (error) {
    req.flash("error", "Error adding inventory. Try again.");
    res.render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      classificationList: await utilities.buildClassificationList(
        req.body.classification_id,
      ),
      errors: null,
      messages: req.flash(),
      ...req.body,
    });
  }
}

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id);
  const invData =
    await invModel.getInventoryByClassificationId(classification_id);
  if (invData.length > 0) {
    // Check if array has elements
    return res.json(invData);
  } else {
    next(new Error("No data returned"));
  }
};

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  console.log("Request body:", req.body);
  const inv_id = parseInt(req.params.inv_id);
  let nav = await utilities.getNav();
  const itemData = await invModel.getInventoryById(inv_id);
  if (!itemData || itemData.length === 0) {
    req.flash("notice", "Vehicle not found.");
    return res.redirect("/inv/");
  }
  // Get first element from array
  const item = itemData[0];
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav();
  const {
    inv_id = "",
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
  } = req.body;
  const updateResult = await invModel.updateInventory(
    inv_id[0] || inv_id,
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
  );

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model;
    req.flash("notice", `The ${itemName} was successfully updated.`);
    res.redirect("/inv/");
  } else {
    const classificationSelect =
      await utilities.buildClassificationList(classification_id);
    const itemName = `${inv_make} ${inv_model}`;
    req.flash("notice", "Sorry, the insert failed.");
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect,
      errors: null,
      inv_id,
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    });
  }
};

/* ***************************
 * Build Delete Confirmation View
 * ************************** */
invCont.buildDeleteConfirm = async function (req, res, next) {
  let nav = await utilities.getNav();
  const { inv_id } = req.params;
  const data = await invModel.getInventoryById(inv_id);
  if (!data || data.length === 0) {
    req.flash("notice", "Inventory item not found.");
    return res.redirect("/inv/");
  }
  const { inv_make, inv_model, inv_year, inv_price } = data[0];
  const name = `${inv_make} ${inv_model}`;
  res.render("./inventory/delete-confirm", {
    title: `Delete ${name}`,
    nav,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_price,
  });
};

/* ***************************
 * Execute Delete of Inventory Item
 * ************************** */
invCont.executeDelete = async function (req, res, next) {
  const { inv_id } = req.body;
  try {
    const result = await invModel.executeDelete(inv_id);
    if (result.rowCount > 0) {
      req.flash("success", "Inventory item deleted successfully.");
      res.redirect("/inv/");
    } else {
      req.flash("notice", "Inventory item not found.");
      res.redirect("/inv/");
    }
  } catch (error) {
    req.flash("error", "Error deleting inventory item: " + error.message);
    res.redirect("/inv/");
  }
};

module.exports = {
  buildByClassificationId: invCont.buildByClassificationId,
  buildVehicleDetail: invCont.buildVehicleDetail,
  buildManagement: invCont.buildManagement,
  getInventoryJSON: invCont.getInventoryJSON,
  editInventoryView: invCont.editInventoryView,
  updateInventory: invCont.updateInventory,
  buildDeleteConfirm: invCont.buildDeleteConfirm,
  executeDelete: invCont.executeDelete,
  buildAddClassification,
  addClassification,
  buildAddInventory,
  addInventory,
};
