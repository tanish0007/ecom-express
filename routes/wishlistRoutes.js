const express = require("express");
const { 
  fetchWishlist, 
  addLikedProduct,
  removeLikedProduct 
} = require("../controllers/wishlistController");

const router = express.Router();

router.get("/:userId", fetchWishlist);  // fetch the wishlist(all liked products) of a specific user..
router.post("/:userId/:productId", addLikedProduct);   // add a liked product in the wishlist..
router.delete("/:userId/:productId", removeLikedProduct);    // remove a liked product from the wishlist..

module.exports = router;