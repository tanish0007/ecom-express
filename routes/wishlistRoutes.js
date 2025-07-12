const express = require("express");
const { 
  addToWishlist, 
  removeFromWishlist 
} = require("../controllers/wishlistController");

const router = express.Router();

router.get("/:userId", fetchWishlist);  // fetch the wishlist(all liked products) of a specific user..
router.post("/:userId/:productId", deleteWholeWishlist);   // add a liked product in the wishlist..
router.delete("/:userId/:productId", IncDecQuantity);    // remove a liked product from the wishlist..

module.exports = router;