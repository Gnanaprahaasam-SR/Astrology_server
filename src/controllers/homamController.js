"use strict";

const express = require("express");
const router = express.Router();
const BookingHomam = require("../model/homam");
const authenticateToken = require("../middleware/authMiddleware");

// ✅ Request Homam API
exports.bookingHomam = async (req, res) => {
    try {
        const { name, phone, address, selectedServices, date, homamType } =
            req.body;

        if (!name || !phone || !address || !selectedServices || !date) {
            return res
                .status(400)
                .json({ message: "All required fields must be filled." });
        }

        // ✅ Create a new booking request
        const booking = new BookingHomam({
            userId: req.user.id, // User from token
            name,
            phone,
            address,
            selectedServices,
            date,
            homamType,
            status: "requested", // Default status
        });
        await booking.save();
        res.json({ message: "Homam request submitted successfully.", booking });
    } catch (error) {
        res.status(500).json({ message: "Error requesting Homam.", error });
    }
};


// ✅ Update Homam Status API
exports.updateHomamBooking = async (req, res) => {
    try {
        const { phone, date, status } = req.body;

        if (!phone || !date || !status) {
            return res
                .status(400)
                .json({ message: "Phone, Date, and Status are required." });
        }

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status value." });
        }

        // ✅ Find and update booking by phone & date
        const booking = await BookingHomam.findOneAndUpdate(
            { phone, date },
            { status },
            { new: true }
        );
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }
        res.json({ message: `Homam request ${status} successfully.`, booking });
    } catch (error) {
        res.status(500).json({ message: "Error updating Homam status.", error });
    }
};

module.exports = router;