"use strict";
const express = require("express");

const { createProductList, getAllProductLists } = require("../controllers/productRequirementController");
const authenticateToken = require("../middleware/authentication");

const router = express.Router();

router.post("/product-list", authenticateToken, createProductList);
router.get("/getProduct-list", authenticateToken, getAllProductLists);

module.exports = router;