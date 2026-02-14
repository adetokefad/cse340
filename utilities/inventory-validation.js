const { body, validationResult } = require("express-validator");
const utilities = require("../utilities");

const validate = {};

validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification name is required.")
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage(
        "Use only letters and numbers, no spaces or special characters.",
      ),
  ];
};

validate.inventoryRules = () => {
  return [
    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Classification is required."),
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Make is required."),
    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Model is required."),
    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Description is required."),
    body("inv_image").trim().notEmpty().withMessage("Image path is required."),
    body("inv_thumbnail")
      .trim()
      .notEmpty()
      .withMessage("Thumbnail path is required."),
    body("inv_price")
      .trim()
      .escape()
      .isFloat({ min: 0 })
      .withMessage("Price must be a positive number."),
    body("inv_year")
      .trim()
      .escape()
      .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
      .withMessage("Year must be between 1900 and next year."),
    body("inv_miles")
      .trim()
      .escape()
      .isInt({ min: 0 })
      .withMessage("Miles must be a positive number."),
    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Color is required."),
  ];
};

validate.checkClassificationData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-classification", {
      errors,
      title: "Add Classification",
      nav,
    });
    return;
  }
  next();
};

validate.checkInventoryData = async (req, res, next) => {
  let errors = validationResult(req);
  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    res.render("inventory/add-inventory", {
      errors,
      title: "Add Inventory",
      nav,
      classificationList: await utilities.buildClassificationList(
        req.body.classification_id,
      ),
      ...req.body, // Sticky fields
    });
    return;
  }
  next();
};

/* ***************************
 * Check data and build list of errors for edit view
 * ************************** */
validate.checkUpdateData = async (req, res, next) => {
  let {
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
  } = req.body;
  let errors = validationResult(req).array(); // Use validationResult to get errors

  if (errors.length > 0) {
    req.flash("error", "Please correct the following errors:");
    const itemName = `${inv_make} ${inv_model}`;
    res.status(400).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav: await utilities.getNav(),
      classificationSelect:
        await utilities.buildClassificationList(classification_id),
      errors,
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
    return;
  }
  next();
};

module.exports = validate;
