import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../../../axios/axios";

function AdminProtectedRoute() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkAdminAuth = async () => {

            try {
                await api.get("/admin/me");

                setIsAuthenticated(true);

            } catch {

                setIsAuthenticated(false);

            } finally {

                setLoading(false);
            }
        };

        checkAdminAuth();

    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0A0D14] flex flex-col items-center justify-center text-white">
                <div className="w-8 h-8 border-3 border-[#8B1D2C] border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-bold uppercase tracking-wider text-neutral-400">Verifying Admin Access...</p>
            </div>
        );
    }

    return isAuthenticated
        ? <Outlet />
        : <Navigate to="/admin/login" replace />;
}

export default AdminProtectedRoute;