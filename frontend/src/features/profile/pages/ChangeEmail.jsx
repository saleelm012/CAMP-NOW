import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import api from "../../../axios/axios";

function ChangeEmail() {
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newEmail.trim() || !currentPassword) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/change-email/request-otp", {
        newEmail,
        currentPassword,
      });

      navigate("/profile/verify-email-change", {
        state: {
          newEmail,
        },
      });
    } catch (error) {
      setError(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back to Profile Link */}
        <button
          type="button"
          onClick={() => navigate("/profile")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Profile</span>
        </button>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1">
            Change <span className="text-[#8B1D2C]">Email</span>
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Enter your new email address and current password to receive a
            verification OTP.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Email */}
            <div>
              <label
                htmlFor="newEmail"
                className="block text-sm sm:text-base font-bold text-neutral-900 mb-2"
              >
                New Email Address
              </label>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <Mail size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter your new email address"
                  required
                  className="w-full h-11 sm:h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />
              </div>
            </div>

            {/* Current Password */}
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm sm:text-base font-bold text-neutral-900 mb-2"
              >
                Current Password
              </label>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <Lock size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="w-full h-11 sm:h-12 pl-12 pr-12 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <p className="text-xs text-neutral-400 mt-1.5">
                Required to verify your identity before updating your email.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <p
                role="alert"
                className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm font-medium"
              >
                {error}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                disabled={loading}
                className="w-full sm:flex-1 h-12 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 shadow-xs flex items-center justify-center"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:flex-1 h-12 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
              >
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangeEmail;
