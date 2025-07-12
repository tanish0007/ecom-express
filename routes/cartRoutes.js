const express = require("express");
const { fetchCart, addToCart, emptyCart, deleteWholeProduct, updateCart } = require("../controllers/cartController");

const router = express.Router();

router.get("/:userId", fetchCart);  // fetch the cart(all products) of a specific user..
router.post("/:userId", addToCart); // add single product to cart..
router.delete("/:userId", emptyCart);   // Empty cart of a user
router.delete("/:userId/:productId", deleteWholeProduct);   // delete a whole product from the cart..
router.patch("/:userId/:productId", updateCart);    // increase or decrease of quantity of a product

module.exports = router;