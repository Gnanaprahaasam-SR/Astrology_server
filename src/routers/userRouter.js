"use strict";
const express = require('express');
const userController = require('../controllers/userController.js');

const router = express.Router();

router.post('/registerUser', userController.createUser);
router.post('/loginUser', userController.userLogin);
router.post('/userVerification', userController.userVerification);
router.post('/resendOTP', userController.resendOTP);
router.get('/logout', userController.userLogout);
router.get('/sessionVerification', userController.userLogout);
router.put('/resetPassword', userController.forgetPassword);

module.exports = router;