"use strict";

const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const encrypt = async (data) => {
    const salt = 10;
    return await bcrypt.hash(data, salt);
}

const decrypt = async (data, hashed) => {
    return await bcrypt.compare(data, hashed);
}

const createToken = async (data) => {
    const generateToken = jwt.sign({ userId: data.userId, email: data.email, password: data.password }, process.env.JWT_SECRET_KEY, { expiresIn: "1d" });
    const updatedUser = await User.findOneAndUpdate({ email: data.email }, { $set: { token: generateToken } }, { new: true });
    console.log(updatedUser)
    if (updatedUser) {
        // console.log("Token generated and user profile updated successfully:", generateToken);
        return generateToken;
    }
    else {
        console.error("Failed to update user profile with token");
        return false;
    }
}

const sendForgotPasswordEmail = async (email, subject, content, duration) => {
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

            <p>Please click the link below to update the password. This link will be valid for the next ${duration} minute(s).</p>

            <a href="${content}" style="text-decoration: none;"> Reset Password </a>

            <p>Best regards,<br/>Mahalakshmi Astrology Team</p>
            `
        };
        const mailStatus = await transporter.sendMail(mailOptions);
        return mailStatus;
    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }

}

const sendOtpEmail = async (email, duration, subject, content) => {
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

        const generatedOtp = Math.floor(100000 + Math.random() * 900000);
        const mailOptions = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject,
            html: `
              <h4>Dear Customer,</h4>
                <p>We are delighted to welcome you to MAHALAKSHMI ASTROLOGY. Thank you for choosing our services.</p>
                <p>${content}</p>
                <p style="color:tomato; font-size:25px; letter-spacing:2px;"><b>${generatedOtp}</b></p>
                <p>Please note, this code <b>is valid for the next ${duration} minute(s)</b>.</p>
                <p>Best regards,<br/>Mahalakshmi Astrology Team</p>
            `
        };
        await transporter.sendMail(mailOptions);
        return generatedOtp;
    } catch (error) {
        console.error("Email send error:", error);
        return false;
    }
};


// exports.verifyOTP = async (req, res) => {
//     const { mobile, otp } = req.body;

//     if (!mobile || !otp) {
//         return res.status(400).json({ message: "Mobile number and OTP are required" });
//     }

//     try {
//         let existingUser = await User.findOne({ mobile });

//         if (!existingUser) {
//             return res.status(404).json({ message: "User not found" });
//         }

//         if (existingUser.otp !== otp) {
//             return res.status(400).json({ message: "Invalid OTP" });
//         }

//         // Find the last user with a userId, sorted by creation time or userId
//         const lastUser = await User.findOne(
//             { userId: { $exists: true } }, // Only users with userId
//             { userId: 1 }, // Only fetch userId field
//             { sort: { userId: -1 } } // Sort by userId descending for the latest
//         );

//         let lastId = 0;
//         if (lastUser && lastUser.userId) {
//             lastId = parseInt(lastUser.userId.replace("ASBO", ""), 10);
//         }

//         const newUserId = `ASBO${String(lastId + 1).padStart(5, "0")}`;
//         existingUser.userId = newUserId;
//         existingUser.otp = null;
//         existingUser.isVerified = true
//         // Save the user with the new userId
//         await existingUser.save();
//         res.status(200).json({ message: "OTP verified successfully", });
//     } catch (error) {
//         console.error("Error verifying OTP:", error);
//         res.status(500).json({ message: "Error verifying OTP", error });
//     }
// };

exports.createUser = async (req, res) => {
    const { email, password, profileType } = req.body;
    console.log("Request body:", req.body);
    try {
        const subject = "Verify Your Profile";
        const content = "Please use the verification code below to complete your registration.";

        // 1. Check for existing verified user
        const existingUser = await User.findOne({ email, isVerified: true });
        if (existingUser) {
            return res.status(409).json({ error: "Email already registered" });
        }

        const hashedPassword = await encrypt(password);

        const otp = await sendOtpEmail(email, 15, subject, content);
        if (!otp) {
            return res.status(500).json({ error: "Failed to send verification email. Registration aborted." });
        }

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                password: hashedPassword,
                profileType,
                isVerified: false,
                otp,
                otpExpiresAt: Date.now() + 15 * 60 * 1000
            });
            await user.save();
        } else {
            user.password = hashedPassword;
            user.profileType = profileType;
            user.isVerified = false;
            user.otp = otp;
            user.otpExpiresAt = Date.now() + 15 * 60 * 1000;
            await user.save();
        }
        return res.status(201).json({ message: "User registered successfully! Please check your email to verify your account." });

    } catch (err) {
        console.error("Error in user registration:", err);
        res.status(500).json({ error: "An error occurred while registering the user." });
    }
};

exports.resendOTP = async (req, res) => {
    // console.log(req.body)
    try {
        const { email } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const subject = "Verifiy Your Profile ";
            const content = `Please use the verification code below to complete your registration`;
            const otpResponse = await sendOtpEmail(email, 15, subject, content);
            // console.log(verifyData, otpResponse);

            if (otpResponse) {
                await User.findOneAndUpdate({ email }, { otp: otpResponse, otpExpiresAt: Date.now() + 15 * 60 * 1000 }, { new: true })
                return res.status(200).json({ status: 200, message: "OTP send successfully !" });
            } else {
                return res.status(424).json({ status: 424, message: "Failed to resend OTP" });
            }
        } else {
            return res.status(404).json({ status: 404, message: "your Email Id Incorrect" });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: "Internal Server Error" });
        console.log(error);
    }
};

exports.userVerification = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find a valid OTP record
        const validOtp = await User.findOne({
            email,
            otp,
            otpExpiresAt: { $gt: new Date() }, // Ensure OTP is not expired
        });

        if (!validOtp) {
            return res.status(400).json({ status: 400, message: "Invalid or expired OTP" });
        }

        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { isVerified: true, otp: null, otpExpiresAt: null } },
            { new: true }
        );

        if (updatedUser) {
            return res.status(200).json({ status: 200, message: "User verified successfully" });
        } else {
            return res.status(406).json({ status: 406, message: "Failed to verify user" });
        }
    } catch (error) {
        console.error("Error in user verification:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

exports.sendForgotPasswordURL = async (req, res) => {

    try {
        const { email } = req.body;
        console.log(email);

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "Please given correct Email Id." });
        }
        const duration = 5;
        const subject = 'Regarding Password Reset Request'
        const content = `${process.env.SERVER}/api/checkUser/${encodeURIComponent(existingUser.email)}/${Date.now() + duration * 60 * 1000}`

        const mailStatus = await sendForgotPasswordEmail(existingUser.email, subject, content, duration);

        if (mailStatus) {
            return res.status(200).json({ status: 200, message: "Reset password link sent successfully. Check you mail!" });
        } else {
            return res.status(424).json({ status: 424, message: "Failed to send email." });
        }

    } catch (error) {
        console.error("Error in forgetPassword:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

exports.redirectClient = async (req, res) => {
    try {
        const { email, time } = req.params; // Use query params

        if (!email || !time) {
            return res.status(400).send("Invalid request.");
        }

        if (parseInt(time) >= Date.now()) {
            return res.redirect(`${process.env.CLIENT}/ForgotPassword/${encodeURIComponent(email)}`);
        } else {
            return res.redirect(`${process.env.CLIENT}/TokenExpired`);
        }

    } catch (error) {
        console.error("Error in redirectClient:", error);
        res.status(500).send("Internal Server Error.");
    }
};

exports.forgetPassword = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(email, password);
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: "Please given correct Email Id." });
        }

        // Encrypt the new password
        const hashedPassword = await encrypt(password);

        // Update user's password
        const updatedUser = await User.findOneAndUpdate(
            { email },
            { $set: { password: hashedPassword } },
            { new: true } // Return updated document
        );

        if (!updatedUser) {
            return res.status(422).json({ status: 422, message: "Failed to update password" });
        }

        return res.status(200).json({ status: 200, message: "Password updated successfully!" });

    } catch (error) {
        console.error("Error in forgetPassword:", error);
        res.status(500).json({ status: 500, message: "Internal Server Error" });
    }
};

exports.userLogin = async (req, res) => {
    const { email, password } = req.body;


    try {
        let existingUser = await User.findOne({ email, isVerified: true });

        if (!existingUser) {
            return res.status(404).json({ message: "Welcome! Please sign Up to create your account before sign In." });
        }
        const passwordmatch = await bcrypt.compare(password, existingUser.password)
        console.log(passwordmatch)
        if (passwordmatch) {
            const newToken = await createToken(existingUser);
            return res.cookie("usertoken", newToken, {
                httpOnly: true, // Prevents client-side access
                sameSite: 'strict', // CSRF protection
                secure: process.env.ENV === "Production", // Uncomment in production (HTTPS)
                maxAge: 24 * 60 * 60 * 1000,
            }).status(200).json({ status: 200, data: existingUser, message: "User logged in successfully" });
        } else {
            return res.status(404).json({ message: "InValid password" })
        }

    } catch (error) {
        console.error("Error on user Login:", error);
        res.status(500).json({ message: "Error on userLogin", error });
    }
};


exports.userLogout = async (req, res) => {
    try {
        res.clearCookie('usertoken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: 'Strict'
        });

        // Send a success response
        return res.status(200).json({
            success: true,
            message: 'User logged out successfully'
        });
    } catch (error) {
        // Handle any unexpected errors
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

exports.userTokenVerification = async (req, res) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.usertoken || req.header("Authorization")?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Unauthorized. Please login." });
        }

        // Verify token
        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
            if (err) {
                // Clear cookie if invalid/expired
                res.clearCookie("usertoken", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "Strict",
                });
                return res.status(401).json({ message: "Session expired. Please login again." });
            }
            console.log(decoded)
            // Token is valid
            return res.status(200).json({
                status: true,
                user: decoded, // Only include necessary info
                message: "Session is valid."
            });
        });
    } catch (error) {
        // Catch unexpected errors
        console.error("Token verification error:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};