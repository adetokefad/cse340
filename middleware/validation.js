const accountModel = require("../models/account-model");

const updateValidation = async (req, res, next) => {
  const { firstName, lastName, email } = req.body;
  const errors = [];
  if (!firstName || !lastName || !email)
    errors.push("All fields are required.");
  const existing = await accountModel.getAccountByEmail(email);
  if (existing.length && existing[0].account_id != req.body.accountId)
    errors.push("Email already exists.");
  if (errors.length) {
    res.render("account/update", { user: req.body, errors, message: null });
    return;
  }
  next();
};

const passwordValidation = (req, res, next) => {
  const { password } = req.body;
  const errors = [];
  if (!password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/)) {
    errors.push(
      "Password must be at least 8 chars with uppercase, lowercase, and a number.",
    );
  }
  if (errors.length) {
    res.render("account/update", { user: req.body, errors, message: null });
    return;
  }
  next();
};

module.exports = { updateValidation, passwordValidation };
