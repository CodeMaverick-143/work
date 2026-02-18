const Issue = require('../models/Issue');
const Project = require('../models/Project');

// @desc    Get issues for a project
// @route   GET /api/issues/:projectId
// @access  Private
const getIssues = async (req, res) => {
    try {
        const issues = await Issue.find({ project: req.params.projectId });
        res.status(200).json(issues);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new issue
// @route   POST /api/issues/:projectId
// @access  Private
const createIssue = async (req, res) => {
    try {
        const { title, description, status, severity, assignedTo } = req.body;
        const project = await Project.findById(req.params.projectId);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        if (project.owner.toString() !== req.user.id) {
            // In a real app, you might check if the user is a member of the project.
            // For now, only the owner can add issues? Or maybe anyone?
            // Let's assume anyone authenticated can add an issue if they know the project ID,
            // or restrictive to owner. Let's restrict to owner for now to be safe, or allow if we had members.
            // The requirements didn't specify project members, so let's stick to owner for management.
            if (project.owner.toString() !== req.user.id) {
                res.status(401);
                throw new Error('User not authorized');
            }
        }


        const issue = await Issue.create({
            project: req.params.projectId,
            title,
            description,
            status,
            severity,
            assignedTo,
        });

        res.status(201).json(issue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update issue
// @route   PUT /api/issues/:id
// @access  Private
const updateIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            res.status(404);
            throw new Error('Issue not found');
        }

        // Check project ownership to allow update
        const project = await Project.findById(issue.project);
        if (project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        const updatedIssue = await Issue.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        res.status(200).json(updatedIssue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete issue
// @route   DELETE /api/issues/:id
// @access  Private
const deleteIssue = async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            res.status(404);
            throw new Error('Issue not found');
        }

        // Check project ownership
        const project = await Project.findById(issue.project);

        if (project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await issue.deleteOne();

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getIssues,
    createIssue,
    updateIssue,
    deleteIssue,
};
