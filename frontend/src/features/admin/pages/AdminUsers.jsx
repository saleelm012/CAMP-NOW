import { useState, useEffect } from "react";
import { getUsers, updateUserStatus } from "../services/AdminUserService";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  UserX,
  UserCheck,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  const limit = 10;

  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState("");

  // Fetch Users
  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getUsers(search, page, limit);

        if (!cancelled) {
          setUsers(data.users);
          setTotalPages(data.pagination.totalPages);
          setTotalUsers(data.pagination.totalUsers);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error.response?.data?.message || "Failed to fetch users"
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timer = setTimeout(fetchUsers, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, page, limit]);

  // Block and Unblock User
  const handleStatusUpdate = async () => {
    if (!selectedUser || updating) return;

    try {
      setUpdating(true);
      setActionError("");

      const data = await updateUserStatus(
        selectedUser._id,
        !selectedUser.isActive
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === selectedUser._id
            ? { ...user, isActive: data.user.isActive }
            : user
        )
      );

      setSelectedUser(null);
    } catch (error) {
      setActionError(
        error.response?.data?.message || "Failed to update user status"
      );
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Heading Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-neutral-900/90 border border-neutral-800/90 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-[#8B1D2C]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#8B1D2C]/20 text-[#E5A8B0] border border-[#8B1D2C]/30 mb-3">
              <Users size={14} />
              <span>Customer Management</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              User <span className="text-[#8B1D2C]">Management</span>
            </h1>

            <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
              Oversee registered customer accounts, view account statuses, and manage access permissions.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto bg-neutral-950/70 border border-neutral-800/90 px-4 py-3 rounded-xl shadow-inner">
            <div className="w-10 h-10 rounded-lg bg-[#8B1D2C]/20 border border-[#8B1D2C]/30 flex items-center justify-center text-[#E5A8B0]">
              <Users size={20} />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Total Accounts</p>
              <p className="text-lg font-extrabold text-white">{totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Toolbar */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by customer name, email address, or phone..."
              aria-label="Search users"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              maxLength={100}
              className="w-full bg-neutral-950/70 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#8B1D2C] focus:ring-1 focus:ring-[#8B1D2C] transition-colors"
            />
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-neutral-800 bg-neutral-950/50 text-neutral-300 hover:text-white hover:bg-neutral-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            disabled={!search}
          >
            <X size={16} />
            <span>Clear Search</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/50 rounded-2xl p-4 text-red-400 text-sm flex items-center gap-3">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Users Table */}
      {loading ? (
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-16 flex flex-col items-center justify-center gap-3 text-neutral-400 shadow-sm">
          <Loader2 size={32} className="animate-spin text-[#8B1D2C]" />
          <p className="text-sm font-medium">Loading customer accounts...</p>
        </div>
      ) : (
        !error && (
          <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-800/90 bg-neutral-950/60 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                    <th className="py-4 px-4 sm:px-6">Customer</th>
                    <th className="py-4 px-4 sm:px-6">Email Address</th>
                    <th className="py-4 px-4 sm:px-6">Phone</th>
                    <th className="py-4 px-4 sm:px-6">Registered Date</th>
                    <th className="py-4 px-4 sm:px-6">Account Status</th>
                    <th className="py-4 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-neutral-800/60 text-sm text-neutral-300">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 px-4 text-center">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <UserX size={36} className="text-neutral-600 mb-1" />
                          <p className="text-neutral-300 font-semibold text-base">No customers found</p>
                          <p className="text-neutral-500 text-xs max-w-sm">
                            {search
                              ? `No user matched your query "${search}". Try searching for another name or email.`
                              : "There are currently no registered users in the database."}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-neutral-800/30 transition-colors duration-150"
                      >
                        {/* Name with initials avatar */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-neutral-800 border border-neutral-700/80 flex items-center justify-center text-xs font-bold text-neutral-200 uppercase">
                              {user.name ? user.name.charAt(0) : "U"}
                            </div>
                            <span className="font-semibold text-white">
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <span className="text-neutral-300">
                            {user.email}
                          </span>
                        </td>

                        {/* Phone */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <span className="text-neutral-400">
                            {user.phone || "—"}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <span className="text-neutral-400 text-xs sm:text-sm">
                            {new Date(user.createdAt).toLocaleDateString("en-IN", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>

                        {/* User Status Badge */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              user.isActive
                                ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/50"
                                : "bg-red-950/60 text-red-400 border-red-800/50"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.isActive ? "bg-emerald-400" : "bg-red-400"
                              }`}
                            />
                            {user.isActive ? "Active" : "Blocked"}
                          </span>
                        </td>

                        {/* Block / Unblock Button */}
                        <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-right">
                          <button
                            type="button"
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              user.isActive
                                ? "border-red-800/40 bg-red-950/30 text-red-400 hover:bg-red-900/40 hover:text-red-300"
                                : "border-emerald-800/40 bg-emerald-950/30 text-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-300"
                            }`}
                            onClick={() => {
                              setSelectedUser(user);
                              setActionError("");
                            }}
                          >
                            {user.isActive ? (
                              <>
                                <UserX size={14} />
                                <span>Block</span>
                              </>
                            ) : (
                              <>
                                <UserCheck size={14} />
                                <span>Unblock</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Pagination */}
      {!loading && !error && totalUsers > 0 && (
        <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <p className="text-xs sm:text-sm text-neutral-400 font-medium">
            Showing <span className="font-semibold text-white">{(page - 1) * limit + 1}</span> -{" "}
            <span className="font-semibold text-white">{Math.min(page * limit, totalUsers)}</span> of{" "}
            <span className="font-semibold text-white">{totalUsers}</span> users
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((prev) => prev - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:text-white hover:bg-neutral-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <span className="px-3 py-1.5 text-xs sm:text-sm font-medium text-neutral-400 bg-neutral-950/50 rounded-lg border border-neutral-800/60">
              Page <span className="font-semibold text-white">{page}</span> of{" "}
              <span className="font-semibold text-white">{totalPages || 1}</span>
            </span>

            <button
              type="button"
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:text-white hover:bg-neutral-800/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Block / Unblock Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div
            className="relative w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
          >
            {/* Modal Header */}
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                  selectedUser.isActive
                    ? "bg-red-950/50 border-red-800/50 text-red-400"
                    : "bg-emerald-950/50 border-emerald-800/50 text-emerald-400"
                }`}
              >
                {selectedUser.isActive ? (
                  <ShieldAlert size={24} />
                ) : (
                  <ShieldCheck size={24} />
                )}
              </div>
              <div>
                <h2
                  id="confirm-modal-title"
                  className="text-lg font-bold text-white tracking-tight"
                >
                  {selectedUser.isActive ? "Block User Account" : "Unblock User Account"}
                </h2>
                <p className="text-xs text-neutral-400">
                  Confirm account access update
                </p>
              </div>
            </div>

            {/* Account Details Box */}
            <div className="bg-neutral-950/60 border border-neutral-800/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Account Name:</span>
                <strong className="text-white font-semibold">{selectedUser.name}</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Email Address:</span>
                <span className="text-neutral-300 font-mono text-[11px]">{selectedUser.email}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
              {selectedUser.isActive
                ? "This user will immediately be barred from signing in and cannot access protected customer services."
                : "This user will have their account unlocked and will be permitted to sign in to the store again."}
            </p>

            {/* Action Error */}
            {actionError && (
              <div className="p-3 bg-red-950/50 border border-red-800/60 rounded-xl text-xs text-red-400 flex items-center gap-2">
                <AlertTriangle size={15} className="shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:text-white hover:bg-neutral-800/80 disabled:opacity-40 transition-colors"
                disabled={updating}
                onClick={() => {
                  setSelectedUser(null);
                  setActionError("");
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl text-white transition-all shadow-md ${
                  selectedUser.isActive
                    ? "bg-red-600 hover:bg-red-500 disabled:bg-red-800"
                    : "bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={updating}
                onClick={handleStatusUpdate}
              >
                {updating && <Loader2 size={16} className="animate-spin" />}
                <span>
                  {updating
                    ? "Updating..."
                    : selectedUser.isActive
                      ? "Confirm Block"
                      : "Confirm Unblock"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
