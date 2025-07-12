const express = require("express");
const { signup, login } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);   // also initializes wishlist of user and cart..

module.exports = router;