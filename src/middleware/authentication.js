"use strict";

const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const token = req.cookies.usertoken || req.header("Authorization")?.split(" ")[1];
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: "Unauthorized. Please login." });
    }

    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            res.clearCookie("usertoken", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "Strict",
            });
            return res.status(401).json({ message: "Session expired. Please login again." });
        }
        req.user = decoded; // Attach decoded user data to request
        next();
    });

};

// const authenticate = (req, res) => {
//     const token = req.cookies.usertoken || req.header("Authorization")?.split(" ")[1];
//     console.log(token);
//     if (!token) {
//         return res.status(401).json({ message: "Unauthorized. Please login." });
//     }

//     jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
//         if (err) {
//             res.clearCookie("usertoken", {
//                 httpOnly: true,
//                 secure: process.env.NODE_ENV === "production",
//                 sameSite: "Strict",
//             });
//             return res.status(401).json({ message: "Session expired. Please login again." });
//         }
//         return decoded; // Attach decoded user data to request
//     });
// }

module.exports = authenticateToken;

