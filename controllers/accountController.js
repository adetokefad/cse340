const utilities = require("../utilities");
const accountModel = require("../models/account-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accCont = {};

/* ****************************************
 * Deliver login view
 * *************************************** */
accCont.buildLogin = async (req, res, next) => {
  let nav = await utilities.getNav();
  res.render("account/login", {
    title: "Login",
    nav,
  });
};

/* ****************************************
 * Deliver registration view
 * *************************************** */
accCont.buildRegister = async (req, res, next) => {
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
accCont.registerAccount = async (req, res) => {
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
accCont.loginAccount = async (req, res) => {
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
 * *************************************** */
accCont.buildManagement = async (req, res, next) => {
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

/* ****************************************
 * Build account update view
 * *************************************** */
accCont.buildUpdate = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id);
  if (
    account_id !== res.locals.accountData.account_id &&
    res.locals.accountData.account_type !== "Admin"
  ) {
    req.flash("error", "You can only update your own account.");
    return res.redirect("/account/update/" + res.locals.accountData.account_id);
  }

  const nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(account_id);

  if (!accountData) {
    req.flash("error", "Account not found.");
    return res.redirect("/account/management");
  }

  res.render("account/update", {
    title: "Update Account",
    nav,
    errors: null,
    accountData,
  });
};

/* ****************************************
 * Process account update
 * FIXED: Gets account_id from req.body (not req.params)
 * FIXED: Uses accountModel (not accModel)
 * FIXED: Updates JWT token after update
 * *************************************** */
accCont.updateAccount = async (req, res, next) => {
  console.log("updateAccount called with req.body:", req.body);

  // FIXED: Get from req.body, not req.params
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;
  const accountIdInt = parseInt(account_id);

  try {
    // Security check
    if (
      accountIdInt !== res.locals.accountData.account_id &&
      res.locals.accountData.account_type !== "Admin"
    ) {
      throw new Error("Unauthorized to update this account");
    }

    // FIXED: Use accountModel (not accModel)
    const updateData = await accountModel.updateAccount(
      accountIdInt,
      account_firstname,
      account_lastname,
      account_email,
    );

    if (updateData && updateData.rowCount) {
      // FIXED: Update JWT token with fresh data
      const updatedAccount = await accountModel.getAccountById(accountIdInt);
      delete updatedAccount.account_password;
      const accessToken = jwt.sign(
        updatedAccount,
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: 3600 * 1000 },
      );
      const cookieOptions = { httpOnly: true, maxAge: 3600 * 1000 };
      if (process.env.NODE_ENV !== "development") cookieOptions.secure = true;
      res.cookie("jwt", accessToken, cookieOptions);

      req.flash("success", "Account updated successfully.");
      res.locals.accountData = updatedAccount;
      return res.redirect("/account/management");
    } else {
      req.flash("error", "Update failed.");
      return res.redirect("/account/update/" + accountIdInt);
    }
  } catch (err) {
    console.error("updateAccount error:", err.stack);
    req.flash("error", err.message);
    return res.redirect("/account/update/" + accountIdInt);
  }
};

/* ****************************************
 * Process password update
 * FIXED: Gets account_id from req.body (not req.params)
 * FIXED: Uses accountModel (not accModel)
 * *************************************** */
accCont.updatePassword = async (req, res, next) => {
  console.log("updatePassword called with req.body:", req.body);

  // FIXED: Get from req.body, not req.params
  const { account_id, account_password } = req.body;
  const accountIdInt = parseInt(account_id);

  try {
    // Security check
    if (
      accountIdInt !== res.locals.accountData.account_id &&
      res.locals.accountData.account_type !== "Admin"
    ) {
      throw new Error("Unauthorized to update this password");
    }

    const hashedPassword = await bcrypt.hash(account_password, 10);

    // FIXED: Use accountModel (not accModel)
    const updateData = await accountModel.updatePassword(
      accountIdInt,
      hashedPassword,
    );

    if (updateData && updateData.rowCount) {
      req.flash("success", "Password updated successfully.");
      return res.redirect("/account/management");
    } else {
      req.flash("error", "Password update failed.");
      return res.redirect("/account/update/" + accountIdInt);
    }
  } catch (err) {
    console.error("updatePassword error:", err.stack);
    req.flash("error", err.message);
    return res.redirect("/account/update/" + accountIdInt);
  }
};

module.exports = accCont;
