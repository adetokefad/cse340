const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const inventoryController = require("../controllers/inventoryController");

// ===== PUBLIC ROUTES (No authentication required) =====

// Route to build inventory by classification view (public)
router.get(
  "/type/:classification_id",
  utilities.handleErrors(inventoryController.buildByClassificationId),
);

// Route to build vehicle detail view (public)
router.get(
  "/detail/:inv_id",
  utilities.handleErrors(inventoryController.buildVehicleDetail),
);

// Route to get inventory JSON (used by management page AJAX)
router.get(
  "/getInventory/:classification_id",
  utilities.handleErrors(inventoryController.getInventoryJSON),
);

// ===== ADMIN ROUTES (Employee or Admin only) =====

// FIXED: Management route now has auth
router.get(
  "/",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.buildManagement),
);

// FIXED: Using utilities.checkLogin and checkAccountType instead of broken adminAuth
router.get(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.buildAddClassification),
);

router.post(
  "/add-classification",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.addClassification),
);

router.get(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.buildAddInventory),
);

router.post(
  "/add-inventory",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.addInventory),
);

router.get(
  "/edit/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.editInventoryView),
);

// FIXED: Added missing update route
router.post(
  "/update",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.updateInventory),
);

router.get(
  "/delete/:inv_id",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.buildDeleteConfirm),
);

router.post(
  "/delete",
  utilities.checkLogin,
  utilities.checkAccountType,
  utilities.handleErrors(inventoryController.executeDelete),
);

module.exports = router;
