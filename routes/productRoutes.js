const express = require("express");
const {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getAllProducts); // apply limit and skip functionality (pagination) if parameters are
router.get("/:id", getProduct);   // fetch a single product
router.post("/", createProduct);  // add a product
router.patch("/:id", updateProduct);  // update a product
router.delete("/:id", deleteProduct); // delete a product

module.exports = router;