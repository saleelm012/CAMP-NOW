import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../../../axios/axios";

function AdminPublicRoute() {

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const checkAdminAuth = async () => {

            try {
                await api.get("/admin/me");

                setIsAuthenticated(true);

            } catch (error) {

                setIsAuthenticated(false);

            } finally {

                setLoading(false);
            }
        };

        checkAdminAuth();

    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated
        ? <Navigate to="/admin/dashboard" replace />
        : <Outlet />;
}

export default AdminPublicRoute;