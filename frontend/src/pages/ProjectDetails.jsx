import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import projectService from '../services/projectService';
import issueService from '../services/issueService';
import AuthContext from '../context/AuthContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [project, setProject] = useState(null);
    const [issues, setIssues] = useState([]);
    const [showIssueModal, setShowIssueModal] = useState(false);
    const [newIssue, setNewIssue] = useState({
        title: '',
        description: '',
        severity: 'Medium',
        status: 'Pending',
    });

    const [editingIssueId, setEditingIssueId] = useState(null);

    const fetchProjectData = async () => {
        try {
            if (user && user.token) {
                const projectData = await projectService.getProject(id, user.token);
                setProject(projectData);
                const issuesData = await issueService.getIssues(id, user.token);
                setIssues(issuesData);
            }
        } catch (error) {
            console.error(error);
            navigate('/projects');
        }
    };

    useEffect(() => {
        fetchProjectData();
    }, [id, user]);

    const handleOpenCreateModal = () => {
        setEditingIssueId(null);
        setNewIssue({
            title: '',
            description: '',
            severity: 'Medium',
            status: 'Pending',
        });
        setShowIssueModal(true);
    };

    const handleEditIssue = (issue) => {
        setNewIssue({
            title: issue.title,
            description: issue.description,
            severity: issue.severity,
            status: issue.status,
        });
        setEditingIssueId(issue._id);
        setShowIssueModal(true);
    };

    const handleCreateOrUpdateIssue = async (e) => {
        e.preventDefault();
        try {
            if (editingIssueId) {
                await issueService.updateIssue(editingIssueId, newIssue, user.token);
            } else {
                await issueService.createIssue(id, newIssue, user.token);
            }
            setShowIssueModal(false);
            setNewIssue({
                title: '',
                description: '',
                severity: 'Medium',
                status: 'Pending',
            });
            setEditingIssueId(null);
            fetchProjectData();
        } catch (error) {
            alert(editingIssueId ? 'Failed to update issue' : 'Failed to create issue');
        }
    };

    const handleDeleteProject = async () => {
        if (window.confirm('Are you sure you want to delete this project?')) {
            try {
                await projectService.deleteProject(id, user.token);
                navigate('/projects');
            } catch (error) {
                alert('Failed to delete project');
            }
        }
    };

    const handleDeleteIssue = async (issueId) => {
        if (window.confirm('Delete this issue?')) {
            try {
                await issueService.deleteIssue(issueId, user.token);
                fetchProjectData();
            } catch (error) {
                alert('Failed to delete issue');
            }
        }
    }

    const onDragEnd = async (result) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            const updatedStatus = destination.droppableId; // 'Pending', 'In Progress', 'Done'

            // Optimistic update
            const updatedIssues = issues.map(issue => {
                if (issue._id === draggableId) {
                    return { ...issue, status: updatedStatus };
                }
                return issue;
            });
            setIssues(updatedIssues);

            try {
                await issueService.updateIssue(draggableId, { status: updatedStatus }, user.token);
            } catch (error) {
                console.error('Failed to update issue status', error);
                fetchProjectData(); // Revert on error
            }
        }
    };

    const getIssuesByStatus = (status) => {
        return issues.filter((issue) => issue.status === status);
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                    <p className="text-gray-600 mb-2">{project.description}</p>
                    <div className="flex space-x-4 text-sm text-gray-500 mb-2">
                        <span>Status: {project.status}</span>
                        <span>Priority: {project.priority}</span>
                        <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex space-x-4 text-sm">
                        {project.codeUrl && (
                            <a href={project.codeUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                Code Repository
                            </a>
                        )}
                        {project.deployUrl && (
                            <a href={project.deployUrl} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">
                                Live Deployment
                            </a>
                        )}
                    </div>
                </div>
                <button
                    onClick={handleDeleteProject}
                    className="text-red-500 hover:text-red-700 p-2"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Issues</h2>
                <button
                    onClick={handleOpenCreateModal}
                    className="btn-primary flex items-center"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Issue
                </button>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Pending', 'In Progress', 'Done'].map((status) => (
                        <Droppable key={status} droppableId={status}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="bg-slate-100/50 p-4 rounded-lg min-h-[500px] border border-slate-200"
                                >
                                    <h3 className="font-bold text-lg mb-4 text-center">{status}</h3>
                                    {getIssuesByStatus(status).map((issue, index) => (
                                        <Draggable
                                            key={issue._id}
                                            draggableId={issue._id}
                                            index={index}
                                        >
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="card mb-3 relative group border-l-4 hover:border-l-[var(--color-paper-secondary)]"
                                                >
                                                    <h4 className="font-bold">{issue.title}</h4>
                                                    <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                                                    <div className="flex justify-between items-center text-xs">
                                                        <span className={`px-2 py-1 rounded ${issue.severity === 'High' ? 'bg-red-100 text-red-800' :
                                                            issue.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'
                                                            }`}>
                                                            {issue.severity}
                                                        </span>
                                                        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button
                                                                onClick={() => handleEditIssue(issue)}
                                                                className="text-gray-400 hover:text-blue-500"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteIssue(issue._id)}
                                                                className="text-red-400 hover:text-red-600"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    ))}
                </div>
            </DragDropContext>

            {/* Add/Edit Issue Modal */}
            {showIssueModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{editingIssueId ? 'Edit Issue' : 'Add New Issue'}</h2>
                        <form onSubmit={handleCreateOrUpdateIssue}>
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
                                    {editingIssueId ? 'Save Changes' : 'Add Issue'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectDetails;
