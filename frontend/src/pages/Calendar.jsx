import { useState, useEffect, useContext } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import meetingService from '../services/meetingService';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import AuthContext from '../context/AuthContext';
import { Plus } from 'lucide-react';

const Calendar = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [newMeeting, setNewMeeting] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
    });
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedEvents, setSelectedEvents] = useState([]);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchData = async () => {
        try {
            if (user && user.token) {
                const meetings = await meetingService.getMeetings(user.token);
                const projects = await projectService.getProjects(user.token);
                const tasks = await taskService.getTasks(user.token);

                const meetingEvents = meetings.map((m) => ({
                    id: m._id,
                    title: `Meeting: ${m.title}`,
                    start: m.date,
                    backgroundColor: '#8b5cf6', // purple
                    borderColor: '#7c3aed',
                    extendedProps: { type: 'meeting', description: m.description },
                }));

                const projectEvents = projects.map((p) => ({
                    id: p._id,
                    title: `Project Due: ${p.title}`,
                    start: p.deadline,
                    allDay: true,
                    backgroundColor: '#3b82f6', // blue
                    borderColor: '#2563eb',
                    extendedProps: { type: 'project' },
                }));

                const taskEvents = tasks.map((t) => ({
                    id: t._id,
                    title: `Task Due: ${t.title}`,
                    start: t.dueDate,
                    allDay: true,
                    backgroundColor: t.status === 'Completed' ? '#10b981' : '#f59e0b', // green or yellow
                    borderColor: t.status === 'Completed' ? '#059669' : '#d97706',
                    extendedProps: { type: 'task' },
                }));

                setEvents([...meetingEvents, ...projectEvents, ...taskEvents]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleDateClick = (arg) => {
        const dateStr = arg.dateStr;
        const dayEvents = events.filter(event => {
            if (!event.start) return false;
            // Use local date to match what user sees on the calendar
            const d = new Date(event.start);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const eventDate = `${year}-${month}-${day}`;
            return eventDate === dateStr;
        });

        setSelectedDate(dateStr);
        setSelectedEvents(dayEvents);
        setShowDetailsModal(true);
    };

    const openScheduleModal = () => {
        setEditingId(null);
        setNewMeeting({
            title: '',
            description: '',
            date: selectedDate || '',
            time: ''
        });
        setShowDetailsModal(false);
        setShowModal(true);
    };

    const handleEditMeeting = (event) => {
        const date = new Date(event.start);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        setNewMeeting({
            title: event.title.replace('Meeting: ', ''),
            description: event.extendedProps.description || '',
            date: `${year}-${month}-${day}`,
            time: time,
        });
        setEditingId(event.id);
        setShowDetailsModal(false);
        setShowModal(true);
    };

    const handleDeleteMeeting = async (meetingId) => {
        if (window.confirm('Are you sure you want to delete this meeting?')) {
            try {
                await meetingService.deleteMeeting(meetingId, user.token);
                // Remove from selectedEvents locally to update modal if open
                setSelectedEvents(prev => prev.filter(e => e.id !== meetingId));
                fetchData();
            } catch (error) {
                alert('Failed to delete meeting');
            }
        }
    };

    const handleCreateOrUpdateMeeting = async (e) => {
        e.preventDefault();
        try {
            // Combine date and time
            const dateTime = new Date(`${newMeeting.date}T${newMeeting.time || '09:00'}`);
            const meetingData = {
                title: newMeeting.title,
                description: newMeeting.description,
                date: dateTime
            };

            if (editingId) {
                await meetingService.updateMeeting(editingId, meetingData, user.token);
            } else {
                await meetingService.createMeeting(meetingData, user.token);
            }

            setShowModal(false);
            setNewMeeting({
                title: '',
                description: '',
                date: '',
                time: '',
            });
            setEditingId(null);
            fetchData();
        } catch (error) {
            alert(editingId ? 'Failed to update meeting' : 'Failed to schedule meeting');
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-serif text-[var(--color-paper-primary)]">Calendar</h1>
                    <p className="text-[var(--color-paper-secondary)] mt-1">Manage your schedule and view project deadlines</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center bg-slate-800 hover:bg-slate-700"
                >
                    <Plus className="w-5 h-5 mr-2" /> Schedule Meeting
                </button>
            </div>

            <div className="card bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="dayGridMonth"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay',
                    }}
                    events={events}
                    dateClick={handleDateClick}
                    height="auto"
                    dayMaxEvents={true}
                    eventClassNames="cursor-pointer hover:opacity-90 transition-opacity"
                />
            </div>

            {/* Day Details Modal */}
            {showDetailsModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-serif text-[var(--color-paper-primary)]">
                                {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h2>
                            <button onClick={() => setShowDetailsModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>
                        <div className="p-6">
                            {selectedEvents.length > 0 ? (
                                <ul className="space-y-3 mb-6">
                                    {selectedEvents.map((event, index) => (
                                        <li key={index} className="flex items-start p-3 bg-slate-50 rounded-lg border border-slate-100 group">
                                            <div className={`w-3 h-3 rounded-full mt-1.5 mr-3 flex-shrink-0`} style={{ backgroundColor: event.backgroundColor }}></div>
                                            <div className="flex-1">
                                                <p className="font-medium text-slate-800">{event.title}</p>
                                                {event.extendedProps.description && (
                                                    <p className="text-sm text-slate-500 mt-0.5">{event.extendedProps.description}</p>
                                                )}
                                                {event.extendedProps.type === 'meeting' && (
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {new Date(event.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                )}
                                            </div>
                                            {event.extendedProps.type === 'meeting' && (
                                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => handleEditMeeting(event)}
                                                        className="text-slate-400 hover:text-blue-600"
                                                        title="Edit"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteMeeting(event.id)}
                                                        className="text-slate-400 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                                                    </button>
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-slate-500 italic text-center py-6">No events scheduled for this day.</p>
                            )}

                            <div className="flex justify-end space-x-3 pt-2 border-t border-slate-100 mt-4">
                                <button
                                    onClick={() => setShowDetailsModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={openScheduleModal}
                                    className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 shadow-md transition-all transform hover:scale-[1.02] font-medium flex items-center"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Schedule Meeting
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Meeting Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-serif text-[var(--color-paper-primary)]">{editingId ? 'Edit Meeting' : 'Schedule Meeting'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <span className="text-2xl leading-none">&times;</span>
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdateMeeting} className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow"
                                    value={newMeeting.title}
                                    onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                                    placeholder="Meeting Title"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow min-h-[100px]"
                                    value={newMeeting.description}
                                    onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                                    placeholder="Add details..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow"
                                        value={newMeeting.date}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Time</label>
                                    <input
                                        type="time"
                                        className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent outline-none transition-shadow"
                                        value={newMeeting.time}
                                        onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 shadow-md transition-all transform hover:scale-[1.02] font-medium"
                                >
                                    {editingId ? 'Save Changes' : 'Schedule'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calendar;
