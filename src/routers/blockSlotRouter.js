const express = require('express');
const router = express.Router();
const blockedSlotController = require('../controllers/blockSlotController');

// Route to get all blocked slots
router.get('/allBlockedSlots', blockedSlotController.getAllBlockedSlots);
router.post('/insertBlockSlots', blockedSlotController.insertBlockSlots);
router.delete('/cancelBlockSlot',blockedSlotController.deleteBlockSlots);

module.exports = router;
