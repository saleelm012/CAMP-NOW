import { Users, DollarSign, ShoppingBag, Activity, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const stats = [
    {
      title: "Total Revenue",
      value: "$48,250",
      change: "+12.5%",
      isPositive: true,
      icon: DollarSign,
      color: "text-emerald-400",
      bg: "bg-emerald-950/40 border-emerald-800/40",
    },
    {
      title: "Total Orders",
      value: "1,420",
      change: "+8.2%",
      isPositive: true,
      icon: ShoppingBag,
      color: "text-[#E5A8B0]",
      bg: "bg-[#8B1D2C]/20 border-[#8B1D2C]/30",
    },
    {
      title: "Active Users",
      value: "3,850",
      change: "+24.0%",
      isPositive: true,
      icon: Users,
      color: "text-sky-400",
      bg: "bg-sky-950/40 border-sky-800/40",
    },
    {
      title: "System Status",
      value: "Operational",
      change: "99.9% Uptime",
      isPositive: true,
      icon: Activity,
      color: "text-emerald-400",
      bg: "bg-emerald-950/40 border-emerald-800/40",
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-950 border border-neutral-800/90 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#8B1D2C]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B1D2C]/20 text-[#E5A8B0] border border-[#8B1D2C]/30 mb-3">
            <ShieldCheck size={14} />
            <span>Store Operations</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Admin Dashboard
          </h1>

          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Welcome to CAMP NOU Admin Panel. Monitor store traffic, oversee member accounts, and track orders in real-time.
          </p>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-neutral-700/80 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  {stat.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center border ${stat.bg} ${stat.color}`}
                >
                  <Icon size={18} />
                </div>
              </div>

              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-2xl font-extrabold text-white tracking-tight">
                  {stat.value}
                </h3>
                <span className="inline-flex items-center text-xs font-bold text-emerald-400 gap-0.5">
                  <ArrowUpRight size={13} />
                  <span>{stat.change}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manage Users Card */}
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Member Management
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5">
              Customer Accounts & Roles
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
              Review registered users, manage permissions, and inspect account activity across the platform.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="inline-flex items-center justify-center gap-2 bg-[#8B1D2C] hover:bg-[#721522] text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 shadow-md shadow-[#8B1D2C]/20 self-start"
          >
            <Users size={16} />
            <span>Manage Users</span>
          </Link>
        </div>

        {/* Security / System Summary Card */}
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Security & Platform
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-800 text-neutral-300">
                v1.0.0
              </span>
            </div>

            <h3 className="text-lg font-bold text-white mb-1.5">
              Encrypted Administrator Channel
            </h3>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
              All management commands, user data queries, and database updates are logged and protected via secure token authentication.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>All systems running normally</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
