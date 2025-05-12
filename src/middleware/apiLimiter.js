const rateLimit = require("express-rate-limit");

const apiRateLimiter = rateLimit({
    windowMs: 2 * 60 * 1000, // 2 minutes
    max: 20, // Max 10 requests per 2 minutes per user
    message: { message: "Too many requests, please try again later." },
    headers: true,
    keyGenerator: (req) => req.ip // Limit by user ID or IP
});


module.exports = apiRateLimiter;
