const mongoose = require('mongoose');

const blockedSlotSchema = new mongoose.Schema({
    fromDate: {
        type: String, // "YYYY-MM-DD"
        required: true
    },
    toDate: {
        type: String, // "YYYY-MM-DD"
        required: true
    },
    startTime: {
        type: String, // "HH:MM AM/PM"
        required: true
    },
    endTime: {
        type: String, // "HH:MM AM/PM"
        required: true
    },
    reason: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BlockedSlot', blockedSlotSchema);
