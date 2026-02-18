import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from './Navbar';

const Layout = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div>Loading...</div>;

    return user ? (
        <div className="flex flex-col h-screen">
            <Navbar />
            <div className="flex-1 overflow-auto p-6">
                <Outlet />
            </div>
        </div>
    ) : (
        <Navigate to="/login" />
    );
};

export default Layout;
