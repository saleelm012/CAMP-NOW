import { ShieldCheck, CircleUserRound } from "lucide-react";

function AdminNavbar() {
    return (
        <header className="h-18 px-4 sm:px-6 lg:px-8 bg-neutral-950/85 backdrop-blur-md border-b border-neutral-800/80 flex items-center justify-between shrink-0 sticky top-0 z-30">
            {/* Left Header Info */}
            <div>
                <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white leading-tight">
                    Admin Panel
                </h2>
                <p className="text-xs text-neutral-400 hidden sm:block">
                    Manage your football store
                </p>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-3 sm:gap-4">
                {/* Role Badge */}
                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B1D2C]/15 text-[#E5A8B0] border border-[#8B1D2C]/30 shadow-xs">
                    <ShieldCheck size={14} className="text-[#E5A8B0]" />
                    <span>Administrator</span>
                </div>

                {/* Profile Pill */}
                <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-neutral-800">
                    <div className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-neutral-300">
                        <CircleUserRound size={22} />
                    </div>
                    <div className="hidden md:block leading-tight text-left">
                        <h4 className="text-xs sm:text-sm font-bold text-white">Admin</h4>
                        <p className="text-[11px] text-neutral-400">Store Administrator</p>
                    </div>
                </div>
            </div>
        </header>
    );
}

export default AdminNavbar;
