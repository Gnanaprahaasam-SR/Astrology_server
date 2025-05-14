

const express = require("express");
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const morgan = require("morgan");
const cookieParser = require("cookie-parser");


app.use(express.json({ limit: "50mb", extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: [`${process.env.CLIENT}`, '*'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE',]
}))

app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());


app.get("/", (req, res) => {
    res.status(200).send("Astrology Server is now Active");
});
const apiLimiter = require("./middleware/apiLimiter");
app.use(apiLimiter);

// User Endpoint
const userDetails = require("./routers/userRouter");
app.use("/api", userDetails);

// Slot Availablity
const slotBooking = require("./routers/slotRouter");
app.use("/api", slotBooking);

//Booking Service Slot 
const bookingServiceSlot = require("./routers/bookingRouter");
app.use("/api", bookingServiceSlot);

// Product List
const productList = require("./routers/productRequirementRouter");
app.use("/api", productList);

// Error handling
app.use((err, req, res, next) => {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
});

module.exports = app;

