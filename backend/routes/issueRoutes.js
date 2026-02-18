const express = require('express');
const router = express.Router();
const {
    getIssues,
    createIssue,
    updateIssue,
    deleteIssue,
} = require('../controllers/issueController');
const { protect } = require('../middleware/auth');

router.route('/:projectId').get(protect, getIssues).post(protect, createIssue);
router.route('/item/:id').put(protect, updateIssue).delete(protect, deleteIssue);

module.exports = router;
