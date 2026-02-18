import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import projectService from '../services/projectService';
import issueService from '../services/issueService';
import AuthContext from '../context/AuthContext';
import { Plus, Search, Filter } from 'lucide-react';

const Projects = () => {
    const { user } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    // Simple modal state for now (ideal: separate component or use a library)
    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        deadline: '',
        priority: 'Medium',
        status: 'Upcoming',
        codeUrl: '',
        deployUrl: '',
    });

    const [editingId, setEditingId] = useState(null);

    // State for adding issue from Projects list
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState(null);
    const [newIssue, setNewIssue] = useState({
        title: '',
        description: '',
        severity: 'Medium',
        status: 'Pending',
    });

    const fetchProjects = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter) params.status = statusFilter;

            // Ensure user.token exists
            if (user && user.token) {
                const data = await projectService.getProjects(user.token, params);
                setProjects(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [user, search, statusFilter]);

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setNewProject({
            title: '',
            description: '',
            deadline: '',
            priority: 'Medium',
            status: 'Upcoming',
            codeUrl: '',
            deployUrl: '',
        });
        setShowModal(true);
    };

    const handleEditProject = (e, project) => {
        e.preventDefault();
        e.stopPropagation();
        setNewProject({
            title: project.title,
            description: project.description,
            deadline: project.deadline.split('T')[0], // Extract YYYY-MM-DD
            priority: project.priority,
            status: project.status,
            codeUrl: project.codeUrl || '',
            deployUrl: project.deployUrl || '',
        });
        setEditingId(project._id);
        setShowModal(true);
    };

    const handleDeleteProject = async (e, projectId) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(projectId, user.token);
                fetchProjects();
            } catch (error) {
                alert('Failed to delete project');
            }
        }
    };

    const handleCreateOrUpdateProject = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await projectService.updateProject(editingId, newProject, user.token);
            } else {
                await projectService.createProject(newProject, user.token);
            }
            setShowModal(false);
            setNewProject({
                title: '',
                description: '',
                deadline: '',
                priority: 'Medium',
                status: 'Upcoming',
                codeUrl: '',
                deployUrl: '',
            });
            setEditingId(null);
            fetchProjects();
        } catch (error) {
            alert(editingId ? 'Failed to update project' : 'Failed to create project');
        }
    };

    const openIssueModal = (e, projectId) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();
        setSelectedProjectId(projectId);
        setShowIssueModal(true);
    };

    const handleCreateIssue = async (e) => {
        e.preventDefault();
        try {
            await issueService.createIssue(selectedProjectId, newIssue, user.token);
            setShowIssueModal(false);
            setNewIssue({
                title: '',
                description: '',
                severity: 'Medium',
                status: 'Pending',
            });
            alert('Issue added successfully');
        } catch (error) {
            alert('Failed to create issue');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Projects</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" /> New Project
                </button>
            </div>

            <div className="flex space-x-4 mb-6">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        className="w-full pl-10 pr-4 py-2 border rounded"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="border p-2 rounded"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All Statuses</option>
                    <option value="Upcoming">Upcoming</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        to={`/projects/${project._id}`}
                        key={project._id}
                        className="card block hover:border-[var(--color-paper-secondary)] relative group"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h2 className="text-xl font-bold text-gray-800">{project.title}</h2>
                            <div className="flex items-center space-x-2">
                                <span
                                    className={`px-2 py-1 rounded text-xs font-semibold ${project.status === 'Completed'
                                        ? 'bg-green-100 text-green-800'
                                        : project.status === 'Ongoing'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                >
                                    {project.status}
                                </span>
                                <div className="hidden group-hover:flex space-x-1">
                                    <button
                                        onClick={(e) => handleEditProject(e, project)}
                                        className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-slate-100"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    </button>
                                    <button
                                        onClick={(e) => handleDeleteProject(e, project._id)}
                                        className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-slate-100"
                                        title="Delete"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-4 line-clamp-2">{project.description}</p>
                        <div className="flex space-x-2 mb-4 text-sm">
                            {project.codeUrl && (
                                <a
                                    href={project.codeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Code
                                </a>
                            )}
                            {project.deployUrl && (
                                <a
                                    href={project.deployUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-green-500 hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    Live Demo
                                </a>
                            )}
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Priority: {project.priority}</span>
                            <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Create/Edit Project Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Project' : 'Create New Project'}</h2>
                        <form onSubmit={handleCreateOrUpdateProject}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    value={newProject.title}
                                    onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border p-2 rounded"
                                    value={newProject.description}
                                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Deadline</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded"
                                    value={newProject.deadline}
                                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={newProject.priority}
                                        onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={newProject.status}
                                        onChange={(e) => setNewProject({ ...newProject, status: e.target.value })}
                                    >
                                        <option value="Upcoming">Upcoming</option>
                                        <option value="Ongoing">Ongoing</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Code URL (Optional)</label>
                                <input
                                    type="url"
                                    className="w-full border p-2 rounded"
                                    value={newProject.codeUrl}
                                    onChange={(e) => setNewProject({ ...newProject, codeUrl: e.target.value })}
                                    placeholder="https://github.com/..."
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-1">Deploy URL (Optional)</label>
                                <input
                                    type="url"
                                    className="w-full border p-2 rounded"
                                    value={newProject.deployUrl}
                                    onChange={(e) => setNewProject({ ...newProject, deployUrl: e.target.value })}
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {editingId ? 'Save Changes' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Add Issue to Project</h2>
                        <form onSubmit={handleCreateIssue}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    value={newIssue.title}
                                    onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border p-2 rounded"
                                    value={newIssue.description}
                                    onChange={(e) => setNewIssue({ ...newIssue, description: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-gray-700 mb-1">Severity</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={newIssue.severity}
                                        onChange={(e) => setNewIssue({ ...newIssue, severity: e.target.value })}
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 mb-1">Status</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={newIssue.status}
                                        onChange={(e) => setNewIssue({ ...newIssue, status: e.target.value })}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Done">Done</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowIssueModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Add Issue
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Projects;
