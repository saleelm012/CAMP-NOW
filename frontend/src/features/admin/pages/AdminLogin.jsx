import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminAuthService";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      await adminLogin({
        email: email.trim(),
        password,
      });

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Ambient Decorative Lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-24 w-96 h-96 bg-[#8B1D2C]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 -mb-20 w-80 h-80 bg-neutral-800/20 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Login Card */}
      <div className="relative w-full max-w-md bg-neutral-900/95 border border-neutral-800/90 rounded-2xl shadow-2xl p-7 sm:p-10 backdrop-blur-xl">
        {/* Brand & Badge Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8B1D2C] to-neutral-900 border border-[#8B1D2C]/40 flex items-center justify-center text-white shadow-lg shadow-[#8B1D2C]/20 mb-3.5">
            <ShieldCheck size={28} className="text-white" strokeWidth={2.2} />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              CAMP NOU
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase bg-[#8B1D2C]/20 text-[#E5A8B0] border border-[#8B1D2C]/30">
              ADMIN PORTAL
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3">
            Welcome Back
          </h1>
          <p className="text-neutral-400 text-sm mt-1">
            Sign in to manage your football store.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
            >
              Email Address
            </label>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none flex items-center justify-center">
                <Mail size={18} strokeWidth={1.8} />
              </div>
              <input
                id="admin-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                required
                className="w-full h-11 sm:h-12 pl-11 pr-4 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700 focus:border-[#8B1D2C] focus:ring-1 focus:ring-[#8B1D2C] shadow-inner"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-2"
            >
              Password
            </label>

            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none flex items-center justify-center">
                <Lock size={18} strokeWidth={1.8} />
              </div>

              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                className="w-full h-11 sm:h-12 pl-11 pr-11 bg-neutral-950/70 border border-neutral-800 rounded-xl text-sm text-white placeholder:text-neutral-500 outline-none transition-all duration-200 hover:border-neutral-700 focus:border-[#8B1D2C] focus:ring-1 focus:ring-[#8B1D2C] shadow-inner"
              />

              <button
                type="button"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-200 cursor-pointer p-1 transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div
              role="alert"
              className="text-red-400 bg-red-950/40 border border-red-800/50 px-4 py-3 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2"
            >
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full h-11 sm:h-12 bg-[#8B1D2C] hover:bg-[#721522] text-white rounded-xl text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 shadow-lg shadow-[#8B1D2C]/20 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Security Footer Note */}
        <div className="mt-8 pt-5 border-t border-neutral-800/80 text-center">
          <p className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 font-medium tracking-wide">
            <Lock size={12} className="text-neutral-500" />
            <span>Authorized personnel only</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
