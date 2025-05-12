
const express = require("express");

const { bookSlot, getUserBookings, getAllUserBookings, updateUserBookings, getAllUserBookingsWithProducts } = require("../controllers/bookingController");
const authenticateToken = require("../middleware/authentication");

const router = express.Router();

router.post("/book-slot", authenticateToken, bookSlot);
router.get("/user-bookings/:userId", authenticateToken, getUserBookings);
router.get("/bookingDetails", authenticateToken, getAllUserBookings);
router.put("/updatebookingStatus", authenticateToken, updateUserBookings);
module.exports = router;