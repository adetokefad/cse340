/* ******************************************
 * This server.js file is the primary file of the
 * application. It is used to control the project.
 *******************************************/

/* ***********************
 * Require Statements
 *************************/
const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const env = require("dotenv").config();
const path = require("path");

const app = express();
const static = require("./routes/static");

/* ***********************
 * Middleware
 *************************/
// Serve static files (css, js, images)
app.use(express.static(path.join(__dirname, "public")));

// EJS Layouts
app.use(expressLayouts);
app.set("layout", "layouts/main"); // Default layout

/* ***********************
 * View Engine
 *************************/
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

/* ***********************
 * Routes
 *************************/
app.use(static);

// Index route
app.get("/", (req, res) => {
  res.render("index", { title: "Home" });
});

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || 3000;

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening at http://localhost:${port}`);
});
