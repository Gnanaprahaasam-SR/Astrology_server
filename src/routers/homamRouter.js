"use strict";

const express = require("express");
const router = express.Router();

const authenticateToken = requrie("../middleware/authentication");
const { bookingHomam, updateHomamBooking } = require("../controllers/homamController")



router.post("/request-homam", authenticateToken, bookingHomam);
router.put("/update-homam-status", authenticateToken, updateHomamBooking)