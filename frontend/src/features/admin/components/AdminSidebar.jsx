import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, LogOut, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { adminLogout } from "../services/adminAuthService";

function AdminSidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;

    setLoading(true);

    try {
      await adminLogout();

      navigate("/admin/login", { replace: true });
    } catch (error) {
      alert(
        error.response?.data?.message || "Logout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="w-full md:w-64 bg-neutral-950/95 border-b md:border-b-0 md:border-r border-neutral-800/80 flex flex-col justify-between shrink-0 md:min-h-screen p-4 sm:p-5">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-neutral-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B1D2C] to-neutral-900 border border-[#8B1D2C]/40 flex items-center justify-center text-white shadow-md shadow-[#8B1D2C]/20 shrink-0">
            <ShieldCheck size={20} className="text-white" strokeWidth={2.2} />
          </div>
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
              CAMP NOU
            </h2>
            <span className="text-[10px] font-extrabold tracking-wider text-[#E5A8B0] uppercase block">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Menu Navigation */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
            Main Menu
          </p>

          <nav className="space-y-1.5">
            <button
              type="button"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                location.pathname === "/admin/dashboard"
                  ? "bg-[#8B1D2C] text-white shadow-md shadow-[#8B1D2C]/25"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
              onClick={() => navigate("/admin/dashboard")}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button
              type="button"
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${
                location.pathname === "/admin/users"
                  ? "bg-[#8B1D2C] text-white shadow-md shadow-[#8B1D2C]/25"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-900"
              }`}
              onClick={() => navigate("/admin/users")}
            >
              <Users size={18} />
              <span>Users</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Sidebar Footer Logout */}
      <div className="pt-4 mt-6 md:mt-auto border-t border-neutral-800/80">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
          <LogOut size={18} />
          <span>{loading ? "Logging out..." : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
}

export default AdminSidebar;
