/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const env = require("dotenv").config();
const app = express();
const static = require("./routes/static");

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route
app.get("/", function (req, res) {
  res.render("index", { title: "Home" });
});

const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 5500;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
