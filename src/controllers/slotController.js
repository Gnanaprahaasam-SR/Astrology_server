"use strict";

const Booking = require("../models/booking");
const BlockedSlot = require("../models/blockSlot");

const services = [
    { id: "jathagam", duration: 30 },
    { id: "kulatheivaPrasanam", duration: 60 },
    { id: "vethalaiPrasanam", duration: 30 },
    { id: "astamangalaPrasanam", duration: 60 },
    { id: "sooliPrasanam", duration: 60 },
];

// Function to check if two time slots overlap
function isOverlapping(start1, end1, start2, end2) {
    return !(end1 <= start2 || start1 >= end2);
}

// Function to convert "hh:mm AM/PM" to minutes
function convertToMinutes(timeStr) {
    const [time, period] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (period === "PM" && hours !== 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;
    return hours * 60 + minutes;
}

// Function to generate time slots dynamically based on service duration

async function generateSlots(date, serviceId) {
    const service = services.find((s) => s.id === serviceId);
    if (!service) throw new Error("Invalid service ID");

    const duration = service.duration;
    const startTime = 11 * 60; // 11:00 AM in minutes
    const endTime = 18 * 60; // 6:00 PM in minutes
    let slots = [];

    // Fetch all bookings for that date
    const bookedSlots = await Booking.find({ date });

    // Fetch blocked slots that overlap the requested date
    const blockedSlots = await BlockedSlot.find({
        fromDate: { $lte: date },
        toDate: { $gte: date }
    });

    for (let time = startTime; time + duration <= endTime; time += duration) {
        let startHour = Math.floor(time / 60);
        let startMin = time % 60;
        let endHour = Math.floor((time + duration) / 60);
        let endMin = (time + duration) % 60;

        let startPeriod = startHour >= 12 ? "PM" : "AM";
        let endPeriod = endHour >= 12 ? "PM" : "AM";

        startHour = startHour > 12 ? startHour - 12 : startHour || 12;
        endHour = endHour > 12 ? endHour - 12 : endHour || 12;

        let startTimeStr = `${startHour}:${startMin.toString().padStart(2, "0")} ${startPeriod}`;
        let endTimeStr = `${endHour}:${endMin.toString().padStart(2, "0")} ${endPeriod}`;

        const slotStartMin = convertToMinutes(startTimeStr);
        const slotEndMin = convertToMinutes(endTimeStr);

        // Check for booking conflict
        const isBooked = bookedSlots.some((booking) =>
            booking.timeSlots.some((t) =>
                isOverlapping(
                    slotStartMin,
                    slotEndMin,
                    convertToMinutes(t.startTime),
                    convertToMinutes(t.endTime)
                )
            )
        );

        // Check for blocked slot conflict
        const isBlocked = blockedSlots.some((block) =>
            isOverlapping(
                slotStartMin,
                slotEndMin,
                convertToMinutes(block.startTime),
                convertToMinutes(block.endTime)
            )
        );

        slots.push({
            startTime: startTimeStr,
            endTime: endTimeStr,
            available: !isBooked && !isBlocked,
            reason: isBlocked ? blockedSlots.find((b) =>
                isOverlapping(
                    slotStartMin,
                    slotEndMin,
                    convertToMinutes(b.startTime),
                    convertToMinutes(b.endTime)
                )
            )?.reason : null
        });
    }

    return slots;
}

// ✅ Get available slots for a service
exports.getAvailableSlots = async (req, res) => {
    const { serviceId, date } = req.query;
    console.log(serviceId, date)

    if (!serviceId || !date) {
        return res.status(400).json({ message: "Service ID and Date are required" });
    }

    try {
        const slots = await generateSlots(date, serviceId);
        res.status(200).json({ slots: slots });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// service specific duration like for specific servie when user allot that serive alone slot false available
// const Booking = require("../model/booking");

// const services = [
//   { id: "jathagam", duration: 30 },
//   { id: "kulatheiva_prasanam", duration: 120 },
//   { id: "vethalai_prasam", duration: 30 },
//   { id: "astamagala_prasanam", duration: 120 },
//   { id: "sooli_prasanam", duration: 60 },
// ];

// // Function to generate slots dynamically based on service duration
// async function generateSlots(date, serviceId) {
//   const service = services.find((s) => s.id === serviceId);

//   if (!service) {
//     throw new Error("Invalid service ID");
//   }

//   const duration = service.duration; // Get the duration for the specific service
//   const startTime = 11 * 60; // 11:00 AM in minutes
//   const endTime = 18 * 60; // 6:00 PM in minutes
//   let slots = [];

//   // Fetch all booked slots for the given date & service
//   const bookedSlots = await Booking.find({ date, selectedServices: serviceId });

//   for (let time = startTime; time + duration <= endTime; time += duration) {
//     let startHour = Math.floor(time / 60);
//     let startMin = time % 60;
//     let endHour = Math.floor((time + duration) / 60);
//     let endMin = (time + duration) % 60;

//     let startPeriod = startHour >= 12 ? "PM" : "AM";
//     let endPeriod = endHour >= 12 ? "PM" : "AM";

//     startHour = startHour > 12 ? startHour - 12 : startHour;
//     endHour = endHour > 12 ? endHour - 12 : endHour;

//     let startTimeStr = `${startHour}:${startMin
//       .toString()
//       .padStart(2, "0")} ${startPeriod}`;
//     let endTimeStr = `${endHour}:${endMin
//       .toString()
//       .padStart(2, "0")} ${endPeriod}`;

//     // Check if this slot is already booked
//     let isBooked = bookedSlots.some((b) =>
//       b.timeSlots.some(
//         (t) => t.startTime === startTimeStr && t.endTime === endTimeStr
//       )
//     );

//     slots.push({
//       startTime: startTimeStr,
//       endTime: endTimeStr,
//       available: !isBooked,
//     });
//   }
//   return slots;
// }

// // ✅ Get available slots for a service
// exports.getAvailableSlots = async (req, res) => {
//   const { serviceId, date } = req.params;

//   if (!serviceId || !date) {
//     return res
//       .status(400)
//       .json({ message: "Service ID and Date are required" });
//   }

//   try {
//     const slots = await generateSlots(date, serviceId);
//     res.json(slots);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

