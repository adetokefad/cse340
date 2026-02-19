const invModel = require("../models/inventory-model");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const Util = {};

Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications();
    console.log("getNav data:", data.rows);
    let list = "<ul>";
    list += '<li><a href="/" title="Home page">Home</a></li>';
    data.rows.forEach((row) => {
      list += "<li>";
      list +=
        '<a href="/inv/type/' +
        row.classification_id +
        '" title="See our inventory of ' +
        row.classification_name +
        ' vehicles">' +
        row.classification_name +
        "</a>";
      list += "</li>";
    });
    list += "</ul>";
    return list;
  } catch (error) {
    console.error("getNav error:", error);
    return `
      <ul>
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>
        <li><a href="/contact">Contact</a></li>
      </ul>
    `;
  }
};

Util.buildVehicleHTML = async function (vehicle) {
  try {
    if (!vehicle) return "<p>No vehicle found.</p>";
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    });
    return `
      <div class="vehicle-detail">
        <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" class="vehicle-image">
        <div class="vehicle-info">
          <h2>${vehicle.inv_make} ${vehicle.inv_model}</h2>
          <p><strong>Year:</strong> ${vehicle.inv_year}</p>
          <p><strong>Price:</strong> ${formatter.format(Number(vehicle.inv_price))}</p>
          <p><strong>Mileage:</strong> ${vehicle.inv_miles.toLocaleString()} miles</p>
          <p><strong>Color:</strong> ${vehicle.inv_color}</p>
          <p><strong>Description:</strong> ${vehicle.inv_description || "No description available."}</p>
        </div>
      </div>
    `;
  } catch (error) {
    console.error("buildVehicleHTML error:", error);
    return "<p>Error displaying vehicle details.</p>";
  }
};

Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

/* ****************************************
 * Middleware to check token validity
 * **************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      function (err, accountData) {
        if (err) {
          req.flash("Please log in");
          res.clearCookie("jwt");
          res.locals.accountData = null;
          res.locals.loggedin = 0;
          return res.redirect("/account/login");
        }
        res.locals.accountData = accountData;
        res.locals.loggedin = 1;
        next();
      },
    );
  } else {
    res.locals.accountData = null;
    res.locals.loggedin = 0;
    next();
  }
};

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  if (res.locals.loggedin) {
    next();
  } else {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }
};

/* ****************************************
 * Middleware to check account type (Employee or Admin only)
 * NEW - Required for inventory authorization
 * ************************************ */
Util.checkAccountType = (req, res, next) => {
  if (res.locals.loggedin) {
    const accountType = res.locals.accountData.account_type;
    if (accountType === "Employee" || accountType === "Admin") {
      next();
      return;
    }
  }
  req.flash(
    "notice",
    "You do not have permission to access that area. Please log in with an authorized account.",
  );
  return res.redirect("/account/login");
};

Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = Util;
