"use strict";

const mongoose = require("mongoose");

const HomamBookingSchema = new mongoose.Schema({
    userId: {
        type: String, // Unique user identifier
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true,
        index: true, // ✅ Indexing for fast queries
    },
    address: {
        type: String,
        required: true,
    },
    selectedServices:
    {
        type: String, // Store service IDs or names
        required: true,
    },
    date: {
        type: String, // Store as "YYYY-MM-DD" for easy querying
        required: true,
        index: true, // ✅ Indexing for fast queries
    },
    homamType: {
        type: String,
    },
    status: {
        type: String,
        enum: ["requested", "accepted", "rejected"],
        default: "requested", // ✅ Default status
    },
}, {
    timestamps: true,
});

// ✅ Compound index to optimize search (phone + date)
HomamBookingSchema.index({ phone: 1, date: 1 });

module.exports = mongoose.model("Homam Bookings", HomamBookingSchema);