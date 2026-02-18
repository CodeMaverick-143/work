const mongoose = require('mongoose');

const issueSchema = mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Project',
        },
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Done'],
            default: 'Pending',
        },
        severity: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    {
        timestamps: true,
    }
);

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
