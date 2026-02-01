const utilities = require("../utilities");

const errorCont = {};

errorCont.triggerError = async function (req, res, next) {
  try {
    throw new Error("Intentional server error for testing");
  } catch (error) {
    error.status = 500;
    next(error);
  }
};

module.exports = errorCont;
