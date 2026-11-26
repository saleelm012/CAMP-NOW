import { Outlet } from "react-router-dom";
import AdminSidebar from "../components/AdminSidebar";
import AdminNavbar from "../components/AdminNavbar";

function AdminLayout() {
    return (
        <div className="min-h-screen bg-[#0A0D14] text-neutral-100 flex flex-col md:flex-row antialiased">
            {/* Sidebar Navigation */}
            <AdminSidebar />

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-[#0A0D14]">
                {/* Navbar */}
                <AdminNavbar />

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AdminLayout;
