const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");

const accountController = {};

/* ****************************************
 * Deliver login view
 * *************************************** */
accountController.buildLogin = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
};

/* ****************************************
 * Deliver registration view
 * *************************************** */
accountController.buildRegister = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("account/register", {
    title: "Register",
    nav,
    errors: null,
  });
};

/* ****************************************
 * Process Registration
 * *************************************** */
accountController.registerAccount = async (req, res) => {
  let nav = await utilities.getNav();
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration.",
    );
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword,
  );

  if (regResult && regResult.rows && regResult.rows.length > 0) {
    req.flash(
      "success",
      `Congratulations, you're registered ${account_firstname}. Please log in.`,
    );
    res.status(201).render("account/login", {
      title: "Login",
      nav,
    });
  } else {
    req.flash("error", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Register",
      nav,
      errors: null,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
};

/* ****************************************
 * Process login request
 * ************************************ */
accountController.loginAccount = async (req, res) => {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  if (!accountData) {
    req.flash("error", "Please check your credentials and try again.");
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      messages: req.flash(),
      account_email,
    });
    return;
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password; // Remove password from payload
      const accessToken = jwt.sign(
        accountData,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 },
      );
      if (process.env.NODE_ENV === "development") {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });
      } else {
        res.cookie("jwt", accessToken, {
          httpOnly: true,
          secure: true,
          maxAge: 3600 * 1000,
        });
      }
      res.clearCookie("account_email");
      return res.redirect("/account/management");
    } else {
      req.flash("error", "Please check your credentials and try again.");
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        messages: req.flash(),
        account_email,
      });
    }
  } catch (error) {
    throw new Error("Access Forbidden");
  }
};

/* ****************************************
 * Build account management view
 * ************************************ */
accountController.buildManagement = async (req, res, next) => {
  try {
    if (!res.locals.loggedin) {
      throw new Error("Please log in to view your account.");
    }
    const nav = await utilities.getNav();
    res.render("account/management", {
      title: "Account Management",
      nav,
      user: res.locals.accountData,
    });
  } catch (err) {
    console.error("buildManagement error:", err.stack);
    req.flash("error", err.message);
    res.redirect("/account/login");
  }
};

accountController.buildUpdate = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id);
  if (
    account_id !== res.locals.accountData.account_id &&
    res.locals.accountData.account_type !== "Admin"
  ) {
    req.flash("error", "You can only update your own account.");
    return res.redirect("/account/update/" + res.locals.accountData.account_id);
  }
  res.render("account/update", {
    title: "Update Account",
    nav: await utilities.getNav(),
    accountData: res.locals.accountData,
  });
};

// In accountController.js
accountController.updateAccount = async (req, res, next) => {
  console.log("updateAccount called with req.body:", req.body);
  const { account_firstname, account_lastname, account_email } = req.body;
  const account_id = parseInt(req.params.account_id);
  try {
    if (
      account_id !== res.locals.accountData.account_id &&
      res.locals.accountData.account_type !== "Admin"
    ) {
      throw new Error("Unauthorized to update this account");
    }
    const updateData = await accModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email,
    );
    if (updateData.rowCount) {
      req.flash("success", "Account updated successfully.");
    } else {
      req.flash("error", "Update failed.");
    }
    res.redirect("/account/management");
  } catch (err) {
    console.error("updateAccount error:", err.stack);
    req.flash("error", err.message);
    res.redirect("/account/update/" + account_id);
  }
};

accountController.updatePassword = async (req, res, next) => {
  console.log("updatePassword called with req.body:", req.body);
  const { account_password } = req.body;
  const account_id = parseInt(req.params.account_id);
  try {
    if (
      account_id !== res.locals.accountData.account_id &&
      res.locals.accountData.account_type !== "Admin"
    ) {
      throw new Error("Unauthorized to update this password");
    }
    const hashedPassword = await bcrypt.hash(account_password, 10);
    const updateData = await accModel.updatePassword(
      account_id,
      hashedPassword,
    );
    if (updateData.rowCount) {
      req.flash("success", "Password updated successfully.");
    } else {
      req.flash("error", "Password update failed.");
    }
    res.redirect("/account/management");
  } catch (err) {
    console.error("updatePassword error:", err.stack);
    req.flash("error", err.message);
    res.redirect("/account/update/" + account_id);
  }
};

module.exports = accountController;
