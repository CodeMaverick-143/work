import { useState, useEffect, useContext } from 'react';
import taskService from '../services/taskService';
import AuthContext from '../context/AuthContext';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

const Tasks = () => {
    const { user } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'Medium',
    });

    const [editingId, setEditingId] = useState(null);

    const fetchTasks = async () => {
        try {
            if (user && user.token) {
                const data = await taskService.getTasks(user.token);
                setTasks(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [user]);

    const handleOpenCreateModal = () => {
        setEditingId(null);
        setNewTask({
            title: '',
            description: '',
            dueDate: '',
            priority: 'Medium',
        });
        setShowModal(true);
    };

    const handleEditTask = (task) => {
        setNewTask({
            title: task.title,
            description: task.description || '',
            dueDate: task.dueDate.split('T')[0],
            priority: task.priority,
        });
        setEditingId(task._id);
        setShowModal(true);
    };

    const handleCreateOrUpdateTask = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await taskService.updateTask(editingId, newTask, user.token);
            } else {
                await taskService.createTask(newTask, user.token);
            }
            setShowModal(false);
            setNewTask({
                title: '',
                description: '',
                dueDate: '',
                priority: 'Medium',
            });
            setEditingId(null);
            fetchTasks();
        } catch (error) {
            alert(editingId ? 'Failed to update task' : 'Failed to create task');
        }
    };

    const handleToggleComplete = async (task) => {
        try {
            const updatedStatus = task.status === 'Completed' ? 'Pending' : 'Completed';

            // Optimistic update
            setTasks(tasks.map(t => t._id === task._id ? { ...t, status: updatedStatus } : t));

            await taskService.updateTask(task._id, { status: updatedStatus }, user.token);
        } catch (error) {
            console.error('Failed to update task');
            fetchTasks(); // Revert
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (window.confirm('Delete this task?')) {
            try {
                await taskService.deleteTask(taskId, user.token);
                setTasks(tasks.filter(t => t._id !== taskId));
            } catch (error) {
                alert('Failed to delete task');
            }
        }
    };

    const pendingTasks = tasks.filter(t => t.status === 'Pending');
    const completedTasks = tasks.filter(t => t.status === 'Completed');

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">My Tasks</h1>
                <button
                    onClick={handleOpenCreateModal}
                    className="btn-primary flex items-center bg-green-700 hover:bg-green-800"
                >
                    <Plus className="w-5 h-5 mr-2" /> New Task
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Pending Tasks */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Pending</h2>
                    <div className="space-y-4">
                        {pendingTasks.map((task) => (
                            <div key={task._id} className="card flex items-start group hover:border-[var(--color-paper-secondary)] relative">
                                <button
                                    onClick={() => handleToggleComplete(task)}
                                    className="mt-1 text-gray-400 hover:text-green-500 mr-3"
                                >
                                    <Circle className="w-6 h-6" />
                                </button>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800">{task.title}</h3>
                                    <p className="text-sm text-gray-600 mb-1">{task.description}</p>
                                    <div className="flex space-x-3 text-xs text-gray-500">
                                        <span className={`px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-800' :
                                            task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {task.priority}
                                        </span>
                                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                                    <button
                                        onClick={() => handleEditTask(task)}
                                        className="text-gray-400 hover:text-blue-500"
                                        title="Edit"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTask(task._id)}
                                        className="text-red-300 hover:text-red-500"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pendingTasks.length === 0 && <p className="text-gray-500 italic">No pending tasks.</p>}
                    </div>
                </div>

                {/* Completed Tasks */}
                <div>
                    <h2 className="text-xl font-bold mb-4 text-gray-700">Completed</h2>
                    <div className="space-y-4">
                        {completedTasks.map((task) => (
                            <div key={task._id} className="bg-gray-50 p-4 rounded border border-gray-200 flex items-start opacity-75 group relative">
                                <button
                                    onClick={() => handleToggleComplete(task)}
                                    className="mt-1 text-green-500 mr-3"
                                >
                                    <CheckCircle className="w-6 h-6" />
                                </button>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 line-through">{task.title}</h3>
                                    <p className="text-sm text-gray-500 mb-1">{task.description}</p>
                                    <div className="text-xs text-gray-400">
                                        Due: {new Date(task.dueDate).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-4 top-4">
                                    <button
                                        onClick={() => handleDeleteTask(task._id)}
                                        className="text-red-300 hover:text-red-500"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {completedTasks.length === 0 && <p className="text-gray-500 italic">No completed tasks.</p>}
                    </div>
                </div>
            </div>

            {/* Create/Edit Task Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{editingId ? 'Edit Task' : 'Add New Task'}</h2>
                        <form onSubmit={handleCreateOrUpdateTask}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border p-2 rounded"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border p-2 rounded"
                                    value={newTask.description}
                                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-1">Due Date</label>
                                <input
                                    type="date"
                                    className="w-full border p-2 rounded"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-700 mb-1">Priority</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={newTask.priority}
                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
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
                                    className="btn-primary bg-green-700 hover:bg-green-800"
                                >
                                    {editingId ? 'Save Changes' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
