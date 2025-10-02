// Needed Resources
const express = require("express");
const router = new express.Router();
const invController = require("../controllers/invController");

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

// New: Detail route
router.get("/detail/:invId", invController.buildByInventoryId);

router.get("/test/error", (req, res, next) => {
  const err = new Error("Intentional test error");
  err.status = 500;
  next(err);
});

module.exports = router;
