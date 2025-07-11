const express = require("express");
const { 
  addToWishlist, 
  removeFromWishlist 
} = require("../controllers/wishlistController");

const router = express.Router();

router.post("/add", addToWishlist);
router.post("/remove", removeFromWishlist);

module.exports = router;