const jwt = require("jsonwebtoken");

const adminAuth = (req, res, next) => {
  try {
    const token = req.cookies.token; // Adjust based on token storage
    if (!token) {
      req.flash("error", "Please log in to access this area.");
      return res.redirect("/account/login");
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.accountType !== "Employee" && decoded.accountType !== "Admin") {
      req.flash("error", "You do not have permission to access this area.");
      return res.redirect("/account/login");
    }
    res.locals.user = decoded; // Update user data for the request
    next();
  } catch (err) {
    req.flash("error", "Invalid session. Please log in again.");
    res.redirect("/account/login");
  }
};

module.exports = { adminAuth };
