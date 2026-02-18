import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { LogOut, Home, Folder, List, Calendar } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-[var(--color-paper-card)] border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-10">
            <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold tracking-tight text-[var(--color-paper-primary)] font-serif">Productivity</h1>
                <div className="flex space-x-6">
                    <Link to="/" className="flex items-center text-slate-500 hover:text-[var(--color-paper-primary)] transition-colors font-medium">
                        <Home className="w-4 h-4 mr-2" /> Dashboard
                    </Link>
                    <Link to="/projects" className="flex items-center text-slate-500 hover:text-[var(--color-paper-primary)] transition-colors font-medium">
                        <Folder className="w-4 h-4 mr-2" /> Projects
                    </Link>
                    <Link to="/tasks" className="flex items-center text-slate-500 hover:text-[var(--color-paper-primary)] transition-colors font-medium">
                        <List className="w-4 h-4 mr-2" /> Tasks
                    </Link>
                    <Link to="/calendar" className="flex items-center text-slate-500 hover:text-[var(--color-paper-primary)] transition-colors font-medium">
                        <Calendar className="w-4 h-4 mr-2" /> Calendar
                    </Link>
                </div>
            </div>
            <div className="flex items-center space-x-6">
                <span className="text-sm font-medium text-slate-600">Welcome, {user && user.username}</span>
                <button
                    onClick={handleLogout}
                    className="flex items-center text-slate-400 hover:text-red-600 transition-colors text-sm font-medium"
                >
                    <LogOut className="w-4 h-4 mr-1" /> Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
