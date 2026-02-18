const Project = require('../models/Project');
const User = require('../models/User');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
    try {
        const { status, sort, search } = req.query;
        const query = { owner: req.user.id };

        if (status) {
            query.status = status;
        }

        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }

        let projects = Project.find(query);

        if (sort) {
            const sortFields = sort.split(',').join(' ');
            projects = projects.sort(sortFields);
        } else {
            projects = projects.sort('-createdAt');
        }

        const results = await projects;
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        if (project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        res.status(200).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
    try {
        const { title, description, status, deadline, priority, tags, codeUrl, deployUrl } = req.body;

        if (!title || !description || !deadline) {
            res.status(400);
            throw new Error('Please add all required fields');
        }

        const project = await Project.create({
            title,
            description,
            status,
            deadline,
            priority,
            tags,
            codeUrl,
            deployUrl,
            owner: req.user.id,
        });

        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        if (project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
            }
        );

        res.status(200).json(updatedProject);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            res.status(404);
            throw new Error('Project not found');
        }

        if (project.owner.toString() !== req.user.id) {
            res.status(401);
            throw new Error('User not authorized');
        }

        await project.deleteOne(); // Use deleteOne() instead of remove()

        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getProjects,
    getProject,
    createProject,
    updateProject,
    deleteProject,
};
