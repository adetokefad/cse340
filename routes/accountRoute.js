const express = require("express");
const router = express.Router();
const utilities = require("../utilities");
const accountController = require("../controllers/accountController");
const regValidate = require("../utilities/account-validation");
const {
  updateValidation,
  passwordValidation,
} = require("../middleware/validation");

router.get(
  "/",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement),
);
router.get("/login", utilities.handleErrors(accountController.buildLogin));
router.get(
  "/register",
  utilities.handleErrors(accountController.buildRegister),
);
router.post(
  "/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  utilities.handleErrors(accountController.registerAccount),
);
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  utilities.handleErrors(accountController.loginAccount),
);
router.get(
  "/management",
  utilities.checkLogin,
  utilities.handleErrors(accountController.buildManagement),
);
router.get(
  "/update/:account_id",
  utilities.handleErrors(accountController.buildUpdate),
);
router.post(
  "/update",
  updateValidation,
  utilities.handleErrors(accountController.updateAccount),
);
router.post(
  "/update-password",
  passwordValidation,
  utilities.handleErrors(accountController.updatePassword),
);
router.get("/logout", (req, res) => {
  req.flash("info", "You have been logged out."); // Set flash message first!
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.redirect("/account/management");
    }
    res.clearCookie("jwt"); // or your session cookie name
    console.log("Session destroyed successfully");
    res.redirect("/account/login"); // Redirect to login page
  });
});

module.exports = router;
