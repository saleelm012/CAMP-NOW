import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import api from "../../../axios/axios";

function PublicRoute() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await api.get("/auth/me");
                setIsAuthenticated(true);
            } catch (error) {
                setIsAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isAuthenticated
        ? <Navigate to="/home" replace />
        : <Outlet />;
}

export default PublicRoute;