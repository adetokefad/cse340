const wishlistModel = require("../models/wishlist-model");
const utilities = require("../utilities");

async function buildWishlist(req, res, next) {
  try {
    console.log("\n=== BUILD WISHLIST ===");
    console.log("Logged in?", res.locals.loggedin);
    console.log("Account data:", res.locals.accountData);
    
    const account_id = res.locals.accountData.account_id;
    console.log("Using account_id:", account_id);
    
    const wishlistItems = await wishlistModel.getWishlistByAccount(account_id);
    console.log("Wishlist items found:", wishlistItems.length);
    console.log("=====================\n");
    
    const nav = await utilities.getNav();
    res.render("wishlist/index", {
      title: "My Wishlist",
      nav,
      wishlistItems,
      errors: null,
    });
  } catch (err) {
    console.error("BUILD WISHLIST ERROR:", err);
    next(err);
  }
}

async function addToWishlist(req, res, next) {
  try {
    console.log("\n========== ADD TO WISHLIST ==========");
    console.log("1. req.body:", req.body);
    console.log("2. req.body.inv_id:", req.body.inv_id);
    console.log("3. res.locals.loggedin:", res.locals.loggedin);
    console.log("4. res.locals.accountData:", res.locals.accountData);
    
    const account_id = res.locals.accountData?.account_id;
    const inv_id = req.body.inv_id;
    
    console.log("5. Extracted account_id:", account_id);
    console.log("6. Extracted inv_id:", inv_id);
    
    if (!inv_id || !account_id) {
      console.log("7. ERROR: Missing data!");
      console.log("   - inv_id missing?", !inv_id);
      console.log("   - account_id missing?", !account_id);
      req.flash("error", "Unable to add to wishlist. Please try again.");
      return res.redirect("back");
    }
    
    console.log("8. Calling wishlistModel.addToWishlist...");
    const result = await wishlistModel.addToWishlist(account_id, inv_id);
    console.log("9. SUCCESS! Result:", result);
    console.log("====================================\n");
    
    req.flash("success", "Vehicle added to wishlist!");
    res.redirect(`/inv/detail/${inv_id}`);
  } catch (err) {
    console.log("10. ERROR CAUGHT:");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Full error:", err);
    console.log("====================================\n");
    
    req.flash("error", "Error: " + err.message);
    res.redirect("back");
  }
}

async function removeFromWishlist(req, res, next) {
  try {
    console.log("\n=== REMOVE FROM WISHLIST ===");
    const account_id = res.locals.accountData.account_id;
    const inv_id = req.params.inv_id;
    console.log("Removing inv_id:", inv_id, "for account:", account_id);
    
    await wishlistModel.removeFromWishlist(account_id, inv_id);
    console.log("SUCCESS: Removed from wishlist");
    console.log("===========================\n");
    
    req.flash("notice", "Vehicle removed from wishlist.");
    res.redirect("/account/wishlist");
  } catch (err) {
    console.error("REMOVE ERROR:", err);
    next(err);
  }
}

async function clearWishlist(req, res, next) {
  try {
    console.log("\n=== CLEAR WISHLIST ===");
    const account_id = res.locals.accountData.account_id;
    console.log("Clearing wishlist for account:", account_id);
    
    await wishlistModel.clearWishlistByAccount(account_id);
    console.log("SUCCESS: Wishlist cleared");
    console.log("======================\n");
    
    req.flash("notice", "Wishlist cleared!");
    res.redirect("/account/wishlist");
  } catch (err) {
    console.error("CLEAR ERROR:", err);
    next(err);
  }
}

module.exports = {
  buildWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};