const express = require('express');
const router = express.Router();
const {
    getMeetings,
    createMeeting,
    deleteMeeting,
    updateMeeting,
} = require('../controllers/meetingController');
const { protect } = require('../middleware/auth');

router.route('/').get(protect, getMeetings).post(protect, createMeeting);
router.route('/:id').delete(protect, deleteMeeting).put(protect, updateMeeting);

module.exports = router;
