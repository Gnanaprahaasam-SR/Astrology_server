"use strict";

const Booking = require("../models/booking");
const moment = require('moment');
const ProductList = require('../models/productRequirement');
const User = require("../models/user");
const nodemailer = require('nodemailer');


function generateBookingId() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}


const sendEmail = async (email, subject, content) => {
    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465, // or 587, depending on your provider
            service: "gmail", // true for 465, false for 587
            secure: true,
            auth: {
                user: process.env.AUTH_EMAIL,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject,
            html: `
              <h4>Dear Customer,</h4>
                <p>${content}</p>
                <p>Best regards,</p>
               <p>Mahalakshmi Astrology Team</p>
            `
        };
        await transporter.sendMail(mailOptions);

    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
};

// ✅ Book a slot
exports.bookSlot = async (req, res) => {
    const { userId,
        name,
        phone,
        address,
        selectedServices,
        count,
        date,
        timeSlots,
        serviceType,
        mapLink,
        bookingStatus,
        cost
    } = req.body;
    console.log(req.body)


    try {
        // Check if any of the requested time slots are already booked
        for (let slot of timeSlots) {
            const existingBooking = await Booking.findOne({
                date,
                "timeSlots.startTime": slot.startTime,
            });

            if (existingBooking) {
                return res.status(409).json({
                    message: `Slot ${slot.startTime} - ${slot.endTime} is already booked`,
                });
            }
        }

        // Generate unique 6-digit bookingId
        let bookingId;
        let isUnique = false;
        while (!isUnique) {
            bookingId = generateBookingId();
            const existing = await Booking.findOne({ bookingId });
            if (!existing) isUnique = true;
        }

        // Create new booking
        const booking = await Booking.create({
            userId,
            name,
            phone,
            address,
            selectedServices,
            count,
            date,
            timeSlots,
            mapLink,
            serviceType,
            bookingStatus,
            bookingId,
            cost
        });
        if (booking) {
            const customer = await User.findById(userId);
            console.log(customer)
            const subject = "Booking Status "
            const content = `Please use this Booking ID for future reference: ${booking.bookingId}. ${(booking.selectedServices === "Jathagam" || booking.selectedServices === "Prasanam")
                    ? "Your booking slot has been confirmed."
                    : "Thank you for your booking. One of our team members will contact you shortly with further details. Please note that your booking is subject to confirmation upon review and approval by our team. We appreciate your patience and understanding."
                }`.trim();

            await sendEmail(customer.email, subject, content);
            res.status(201).json({ message: "Booking successful", booking });
        }
        else {
            console.log("failed to book");
        }
    } catch (error) {
        res.status(500).json({ message: "Error booking slot", error });
    }
};


// ✅ Get bookings for a user
exports.getUserBookings = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
    }

    try {
        const bookings = await Booking.find({ userId });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user bookings", error });
    }
};

exports.getAllUserBookings = async (req, res) => {

    try {
        const bookings = await Booking.aggregate([
            {
                $lookup: {
                    from: 'productlists',
                    localField: 'bookingId',          // Field in Booking
                    foreignField: 'bookingId',        // Field in ProductList
                    as: 'productList'                 // Output array field
                }
            },

        ]);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Error fetching user bookings", error });
    }
};


exports.updateUserBookings = async (req, res) => {
    const { id, timeSlots, bookingStatus } = req.body;
    console.log(req.body);

    try {
        // Fetch the booking to update
        const booking = await Booking.findOne({ bookingId: id });
        if (!booking) {
            return res.status(404).json({ message: "Booking not found." });
        }

        // Only check for overlap if timeSlots are being updated
        if (timeSlots && timeSlots.length > 0) {
            // Fetch all bookings for the same date and serviceType (excluding current booking)
            const existingBookings = await Booking.find({
                date: booking.date,
                bookingStatus: { $ne: "Cancelled" } // Optionally exclude cancelled
            });

            // Flatten all existing time slots for these bookings
            const existingTimeSlots = existingBookings.flatMap(b => b.timeSlots || []);

            // Helper to convert "11:00 AM" to minutes since midnight
            function timeToMinutes(timeStr) {
                const m = moment(timeStr, ["h:mm A"]);
                return m.hours() * 60 + m.minutes();
            }

            // Check for overlap
            for (const newSlot of timeSlots) {
                const newStart = timeToMinutes(newSlot.startTime);
                const newEnd = timeToMinutes(newSlot.endTime);

                for (const existSlot of existingTimeSlots) {
                    const existStart = timeToMinutes(existSlot.startTime);
                    const existEnd = timeToMinutes(existSlot.endTime);

                    // Overlap if newStart < existEnd && newEnd > existStart
                    if (newStart < existEnd && newEnd > existStart) {
                        return res.status(400).json({
                            message: `Time slot ${newSlot.startTime} - ${newSlot.endTime} overlaps with existing slot ${existSlot.startTime} - ${existSlot.endTime}`
                        });
                    }
                }
            }
        }

        // Build update object
        let updateFields = {};
        if (timeSlots) updateFields.timeSlots = timeSlots;
        if (bookingStatus) updateFields.bookingStatus = bookingStatus;

        // Update booking
        const updateBooking = await Booking.findOneAndUpdate(
            { bookingId: id },
            updateFields,
            { new: true }
        );
        if (updateBooking) {
            const customer = await User.findById(booking.userId);
            console.log(customer)
            const subject = "Booking Status "
            const content = `Please use this Booking ID for future reference, <span style="color:tomato; font-size:25px; letter-spacing:2px;">${booking.bookingId}</span>. ${booking.bookingStatus === "Confirmed" ? "Your booking slot has been confirmed " : "Your booking slot has been cancelled. If you have any questions or need clarification, please contact our team"}`.trim();
            await sendEmail(customer.email, subject, content);
            return res.status(200).json({
                message: "Booking status is updated successfully",
                booking: updateBooking
            });
        }

    } catch (error) {
        res.status(500).json({ message: "Error on updating user bookings", error: error.message });
    }
};



