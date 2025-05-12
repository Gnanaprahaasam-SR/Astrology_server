"use strict";

const Booking = require("../models/booking");

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

    // Fetch all booked slots for the given date (across all services)
    const bookedSlots = await Booking.find({ date });

    for (let time = startTime; time + duration <= endTime; time += duration) {
        let startHour = Math.floor(time / 60);
        let startMin = time % 60;
        let endHour = Math.floor((time + duration) / 60);
        let endMin = (time + duration) % 60;

        let startPeriod = startHour >= 12 ? "PM" : "AM";
        let endPeriod = endHour >= 12 ? "PM" : "AM";

        startHour = startHour > 12 ? startHour - 12 : startHour;
        endHour = endHour > 12 ? endHour - 12 : endHour;

        let startTimeStr = `${startHour}:${startMin
            .toString()
            .padStart(2, "0")} ${startPeriod}`;
        let endTimeStr = `${endHour}:${endMin
            .toString()
            .padStart(2, "0")} ${endPeriod}`;

        // Convert current slot to minutes for comparison
        const slotStartMin = convertToMinutes(startTimeStr);
        const slotEndMin = convertToMinutes(endTimeStr);

        // Check if this slot overlaps with any booked slot
        let isBooked = bookedSlots.some((booking) =>
            booking.timeSlots.some((t) =>
                isOverlapping(
                    slotStartMin,
                    slotEndMin,
                    convertToMinutes(t.startTime),
                    convertToMinutes(t.endTime)
                )
            )
        );

        slots.push({
            startTime: startTimeStr,
            endTime: endTimeStr,
            available: !isBooked,
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


// "use strict";

// const services = [
//     { id: "jathagam", duration: 30 },
//     { id: "kulatheiva_prasanam", duration: 120 },
//     { id: "vethalai_prasanam", duration: 30 },
//     { id: "astamagala_prasanam", duration: 120 },
//     { id: "sooli_prasanam", duration: 60 },
// ];

// // Convert "hh:mm AM/PM" to minutes
// const toMinutes = (timeStr) => {
//     const [time, period] = timeStr.split(" ");
//     const [hours, minutes] = time.split(":").map(Number);
//     return ((period === "PM" && hours !== 12) ? hours + 12 : (period === "AM" && hours === 12) ? 0 : hours) * 60 + minutes;
// };

// // Format minutes to "hh:mm AM/PM"
// const toTimeStr = (minutes) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     const period = hours >= 12 ? "PM" : "AM";
//     const displayHour = hours > 12 ? hours - 12 : hours || 12;
//     return `${displayHour}:${mins.toString().padStart(2, "0")} ${period}`;
// };

// // Generate slots using a time availability map
// const generateSlots = async (date, serviceId) => {
//     const service = services.find((s) => s.id === serviceId);
//     if (!service) throw new Error("Invalid service ID");

//     const { duration } = service;
//     const startTime = 11 * 60; // 11:00 AM
//     const endTime = 18 * 60;   // 6:00 PM

//     // Fetch booked slots
//     const bookedSlots = await Booking.find({ date }, { timeSlots: 1 }).lean().exec();
//     const bookedRanges = bookedSlots.flatMap((b) =>
//         b.timeSlots.map((t) => ({
//             start: toMinutes(t.startTime),
//             end: toMinutes(t.endTime),
//         }))
//     );

//     // Create a map of occupied minutes
//     const timeMap = new Map();
//     for (let time = startTime; time < endTime; time++) {
//         timeMap.set(time, true); // Default: available
//     }
//     for (const { start, end } of bookedRanges) {
//         for (let t = start; t < end; t++) {
//             timeMap.set(t, false); // Mark as booked
//         }
//     }

//     // Generate slots based on availability
//     const slots = [];
//     for (let time = startTime; time + duration <= endTime; time += duration) {
//         const slotStart = time;
//         const slotEnd = time + duration;
//         const isAvailable = Array.from({ length: duration }, (_, i) => timeMap.get(slotStart + i)).every(Boolean);

//         slots.push({
//             startTime: toTimeStr(slotStart),
//             endTime: toTimeStr(slotEnd),
//             available: isAvailable,
//         });
//     }

//     return slots;
// };

// // API handler
// exports.getAvailableSlots = async (req, res) => {
//     const { serviceId, date } = req.params;

//     if (!serviceId || !date) {
//         return res.status(400).json({ message: "Service ID and date are required" });
//     }

//     try {
//         const slots = await generateSlots(date, serviceId);
//         res.json(slots);
//     } catch (error) {
//         res.status(error.message === "Invalid service ID" ? 400 : 500).json({
//             message: error.message,
//         });
//     }
// };