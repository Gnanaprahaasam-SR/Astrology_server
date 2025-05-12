"use strict";

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    otp: {
        type: String,
    },
    otpExpiresAt: {
        type: Date,
        trim: true,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    token: {
        type: String,
        trim: true,
        select: false
    },
    profileType: {
        type: String,
        enum: ['Customer', 'Admin'],
        default: 'Customer',
    }
}, {
    timestamps: true,
});







module.exports = mongoose.model("User", userSchema);