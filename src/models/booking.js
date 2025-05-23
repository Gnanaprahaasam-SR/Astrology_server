const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
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
    },
    address: {
        type: String,
        required: true,
    },
    selectedServices: {
        type: String, // Store service IDs or names
        required: true,
    },
    count: {
        type: Number,
        default: 1, // Default to 1 person if not provided
    },
    date: {
        type: String, // Store as "YYYY-MM-DD" for easy querying
        required: true,
        index: true, // Improves performance when checking availability
    },
    timeSlots: [
        {
            startTime: {
                type: String, // "HH:MM AM/PM"
            },
            endTime: {
                type: String, // "HH:MM AM/PM"
            },
        },
    ],
    serviceType: {
        type: String,
    },
    mapLink: {
        type: String,
    },
    bookingStatus: {
        type: String,
        required: true
    },
    bookingId: {
        type: Number,
    },
    cost: {
        type: Number
    },
    document: {
        type: [String]
    }
}, {
    timestamps: true,
});

bookingSchema.pre('save', function (next) {
    if (!this.mapLink) {
        this.mapLink = "";
    }
    if (!this.serviceType) {
        this.serviceType = "";
    }
    next();
});

// Indexing to speed up date-based queries
bookingSchema.index({ date: 1, "timeSlots.startTime": 1, bookingId: 1 });

module.exports = mongoose.model("Booking", bookingSchema);