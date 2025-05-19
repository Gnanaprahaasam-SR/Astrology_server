"use strict";

const dotenv = require('dotenv');
dotenv.config();
const app = require("./src/index");
const mongooes = require('mongoose');

mongooes.connect(process.env.DB_URL_DEV,{family:4})
    .then(() => {
        console.log("Connected to MongoDB");
        app.listen(process.env.PORT, () => {
            console.log(`Server is running on port ${process.env.PORT}`);
        });
    })
    .catch((err) => {
        console.error("Failed to connect to MongoDB", err);
    });
