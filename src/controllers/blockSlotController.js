'use strict';

const Booking = require('../models/booking');
const BlockedSlot = require('../models/blockSlot');

exports.insertBlockSlots = async (req, res) => {
    const { fromDate, toDate, startTime, endTime, reason } = req.body;
    console.log(req.body);

    try {
        // Step 1: Check for conflicting bookings
        const conflictingBookings = await Booking.find({
            date: { $gte: fromDate, $lte: toDate },
            timeSlots: {
                $elemMatch: {
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime },
                }
            },
            bookingStatus: { $ne: "Cancelled" }
        });

        if (conflictingBookings.length > 0) {
            const conflicts = conflictingBookings.map(booking => ({
                bookingId: booking.bookingId,
                date: booking.date,
                timeSlots: booking.timeSlots,
                name: booking.name,
                phone: booking.phone
            }));

            return res.status(409).json({
                message: "Cannot block the slot. Conflicting bookings exist.",
                conflicts
            });
        }

        // Step 2: Check for overlapping blocked slots
        const overlappingBlocks = await BlockedSlot.find({
            $or: [
                {
                    fromDate: { $lte: toDate },
                    toDate: { $gte: fromDate },
                    startTime: { $lt: endTime },
                    endTime: { $gt: startTime }
                }
            ]
        });

        if (overlappingBlocks.length > 0) {
            return res.status(409).json({
                message: "Cannot block the slot. Overlapping blocked slot(s) exist.",
                overlappingBlocks
            });
        }

        // Step 3: No conflicts, proceed to block the slot
        const blocked = await BlockedSlot.create({
            fromDate,
            toDate,
            startTime,
            endTime,
            reason
        });

        res.status(201).json({
            message: "Slot successfully blocked",
            blocked
        });

    } catch (error) {
        console.error("Error blocking slot:", error);
        res.status(500).json({ message: "Internal server error", error });
    }
};


exports.getAllBlockedSlots = async (req, res) => {
    try {
        const blockedSlots = await BlockedSlot.find().sort({ fromDate: 1, startTime: 1 });
        if (blockedSlots) {
            res.status(200).json({ blockedSlots });
        } else {
            res.status(404).json({ message: "No BlockSlots is available" });
        }

    } catch (error) {
        console.error('Error fetching blocked slots:', error);
        res.status(500).json({ message: 'Error fetching blocked slots', error });
    }
};


exports.deleteBlockSlots = async (req, res) => {
    const { id } = req.body;
    console.log(id)
    try {
        const deleteBlockedSlots = await BlockedSlot.findByIdAndDelete(id);
        if (deleteBlockedSlots) {
            res.status(200).json({ message: "Blocked slot deleted successfully", deleteBlockedSlots });
        } else {
            res.status(404).json({ message: "No blocked slot found with the provided ID." });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting blocked slot", error: error.message });
    }
};
