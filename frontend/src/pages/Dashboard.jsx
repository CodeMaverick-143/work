import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import meetingService from '../services/meetingService';
import { CheckCircle, Clock, Calendar as CalendarIcon, AlertCircle } from 'lucide-react';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({
        pendingProjects: [],
        pendingTasks: [],
        upcomingMeetings: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (user && user.token) {
                try {
                    const [projects, tasks, meetings] = await Promise.all([
                        projectService.getProjects(user.token),
                        taskService.getTasks(user.token),
                        meetingService.getMeetings(user.token)
                    ]);

                    const pendingProjects = projects.filter(p => p.status !== 'Completed').slice(0, 5);
                    const pendingTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 5);

                    // Filter upcoming meetings (future dates)
                    const now = new Date();
                    const upcomingMeetings = meetings
                        .filter(m => new Date(m.date) > now)
                        .sort((a, b) => new Date(a.date) - new Date(b.date))
                        .slice(0, 5);

                    setStats({ pendingProjects, pendingTasks, upcomingMeetings });
                } catch (error) {
                    console.error("Error fetching dashboard data", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchData();
    }, [user]);

    if (loading) return <div className="p-6">Loading dashboard...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Link to="/projects" className="card border-l-4 border-blue-500 hover:translate-y-[-2px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-paper-primary)]">Projects</h2>
                            <p className="text-[var(--color-paper-secondary)]">{stats.pendingProjects.length} Active</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-blue-500" />
                    </div>
                </Link>
                <Link to="/tasks" className="card border-l-4 border-green-500 hover:translate-y-[-2px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-paper-primary)]">Tasks</h2>
                            <p className="text-[var(--color-paper-secondary)]">{stats.pendingTasks.length} Pending</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </Link>
                <Link to="/calendar" className="card border-l-4 border-purple-500 hover:translate-y-[-2px]">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-paper-primary)]">Meetings</h2>
                            <p className="text-[var(--color-paper-secondary)]">{stats.upcomingMeetings.length} Upcoming</p>
                        </div>
                        <CalendarIcon className="w-8 h-8 text-purple-500" />
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Tasks */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Pending Tasks</h2>
                        <Link to="/tasks" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="space-y-3">
                        {stats.pendingTasks.length > 0 ? (
                            stats.pendingTasks.map(task => (
                                <div key={task._id} className="flex justify-between items-center p-3 bg-gray-50 rounded border border-gray-100">
                                    <div className="flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-3 ${task.priority === 'High' ? 'bg-red-500' :
                                            task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                            }`}></div>
                                        <div>
                                            <p className="font-medium text-gray-800">{task.title}</p>
                                            <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs px-2 py-1 bg-gray-200 rounded text-gray-600">
                                        {task.priority}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-center py-4">No pending tasks.</p>
                        )}
                    </div>
                </div>

                {/* Upcoming Meetings & Deadlines */}
                <div className="card">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Upcoming Meetings</h2>
                        <Link to="/calendar" className="text-sm text-purple-600 hover:underline">View Calendar</Link>
                    </div>
                    <div className="space-y-3">
                        {stats.upcomingMeetings.length > 0 ? (
                            stats.upcomingMeetings.map(meeting => (
                                <div key={meeting._id} className="flex items-start p-3 bg-purple-50 rounded border border-purple-100">
                                    <div className="mr-3 mt-1 bg-purple-200 p-1 rounded text-purple-700">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{meeting.title}</p>
                                        <p className="text-sm text-gray-600">{meeting.description}</p>
                                        <p className="text-xs text-purple-600 mt-1 font-semibold">
                                            {new Date(meeting.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-center py-4">No upcoming meetings.</p>
                        )}
                    </div>
                </div>

                {/* Active Projects */}
                <div className="card lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Active Projects</h2>
                        <Link to="/projects" className="text-sm text-blue-600 hover:underline">View All</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stats.pendingProjects.length > 0 ? (
                            stats.pendingProjects.map(project => (
                                <Link key={project._id} to={`/projects/${project._id}`} className="block p-4 border rounded hover:bg-gray-50 transition">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-gray-800">{project.title}</h3>
                                        <span className={`px-2 py-0.5 rounded text-xs ${project.status === 'Ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {project.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{project.description}</p>
                                    <div className="mt-3 flex justify-between text-xs text-gray-500">
                                        <span>Priority: {project.priority}</span>
                                        <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-center py-4 col-span-2">No active projects.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
