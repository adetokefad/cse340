const invModel = require("../models/inventory-model");
const Util = {};

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  let data = await invModel.getClassifications();
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
};

/* ************************
 * Middleware for handling errors
 ************************ */
Util.handleErrors = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ************************
 * Build the classification view HTML
 ************************ */
Util.buildClassificationGrid = async function (data) {
  let grid;
  if (data.length > 0) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += "<li>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="View ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details"><img src="' +
        vehicle.inv_thumbnail +
        '" alt="Image of ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' on CSE Motors" /></a>';
      grid += '<div class="nameprice">';
      grid += "<hr />";
      grid += "<h2>";
      grid +=
        '<a href="../../inv/detail/' +
        vehicle.inv_id +
        '" title="view ' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        ' details">' +
        vehicle.inv_make +
        " " +
        vehicle.inv_model +
        "</a>";
      grid += "</h2>";
      grid +=
        "<span>$" +
        new Intl.NumberFormat("en-US").format(vehicle.inv_price) +
        "</span>";
      grid += "</div>";
      grid += "</li>";
    });
    grid += "</ul>";
  } else {
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>';
  }
  return grid;
};

/* ************************
 * Build a single vehicle detail view
 ************************ */
Util.buildVehicleDetailView = function (vehicle) {
  const priceFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(vehicle.inv_price);

  const mileageFormatted = new Intl.NumberFormat("en-US").format(
    vehicle.inv_miles
  );

  return `
    <section class="vehicle-detail">
      <img src="${vehicle.inv_image}" alt="${vehicle.inv_make} ${vehicle.inv_model}" />
      <h1>${vehicle.inv_make} ${vehicle.inv_model} (${vehicle.inv_year})</h1>
      <p><strong>Price:</strong> ${priceFormatted}</p>
      <p><strong>Mileage:</strong> ${mileageFormatted} miles</p>
      <p>${vehicle.inv_description}</p>
    </section>
  `;
};

/* ************************
 * Export all utils
 ************************ */
module.exports = {
  getNav: Util.getNav,
  handleErrors: Util.handleErrors,
  buildClassificationGrid: Util.buildClassificationGrid,
  buildVehicleDetailView: Util.buildVehicleDetailView,
};
