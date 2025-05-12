"use strict"

const express = require("express");
const router = express.Router();
const { getAvailableSlots } = require("../controllers/slotController");
const authenticateToken = require("../middleware/authentication");


router.get("/available-slots",authenticateToken, getAvailableSlots);

module.exports = router;