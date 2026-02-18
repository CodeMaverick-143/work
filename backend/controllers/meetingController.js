const Meeting = require('../models/Meeting');

// @desc    Get all meetings for a user
// @route   GET /api/meetings
// @access  Private
const getMeetings = async (req, res) => {
    try {
        const meetings = await Meeting.find({ owner: req.user.id }).sort('date');
        res.status(200).json(meetings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Schedule new meeting
// @route   POST /api/meetings
// @access  Private
const createMeeting = async (req, res) => {
    try {
        const { title, description, date, participants } = req.body;

        if (!title || !date) {
            res.status(400);
            throw new Error('Please add all required fields');
        }

        const meeting = await Meeting.create({
            title,
            description,
            date,
            participants,
            owner: req.user.id,
        });

        res.status(201).json(meeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private
const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            res.status(404);
            throw new Error('Meeting not found');
        }

        if (meeting.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await meeting.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private
const updateMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            res.status(404);
            throw new Error('Meeting not found');
        }

        if (meeting.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        const updatedMeeting = await Meeting.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedMeeting);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getMeetings,
    createMeeting,
    deleteMeeting,
    updateMeeting,
};
