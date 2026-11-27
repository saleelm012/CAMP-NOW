import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../axios/axios";
import { Eye, EyeOff, Lock, ArrowLeft } from "lucide-react";

function ChangePassword() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "newPassword" && {
        confirmPassword: "",
      }),
    }));

    setError("");
  };
  const validateForm = () => {
    const errors = {};

    const { currentPassword, newPassword, confirmPassword } = formData;

    // Current password validation
    if (!currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    } else if (new TextEncoder().encode(currentPassword).length > 72) {
      errors.currentPassword = "Password must not exceed 72 bytes";
    }

    // New password validation
    if (!newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (new TextEncoder().encode(newPassword).length > 72) {
      errors.newPassword = "Password must not exceed 72 bytes";
    } else if (currentPassword === newPassword) {
      errors.newPassword =
        "New password must be different from current password";
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.patch("/auth/change-password", formData);

      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Back to Profile Link */}
        <div className="mb-4">
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Profile</span>
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1">
            Change <span className="text-[#8B1D2C]">Password</span>
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Update your account password to ensure your profile stays secure.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {" "}
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
                  type={showCurrentPassword ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  required
                  aria-invalid={!!fieldErrors.currentPassword}
                  aria-describedby={
                    fieldErrors.currentPassword
                      ? "currentPassword-error"
                      : undefined
                  }
                  className={`w-full h-11 sm:h-12 pl-12 pr-12 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                    fieldErrors.currentPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  aria-label={
                    showCurrentPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 transition-colors"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>

              {fieldErrors.currentPassword && (
                <p
                  id="currentPassword-error"
                  className="text-red-600 text-xs mt-1.5"
                >
                  {fieldErrors.currentPassword}
                </p>
              )}
            </div>
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm sm:text-base font-bold text-neutral-900 mb-2"
              >
                New Password
              </label>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <Lock size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password (min. 8 characters)"
                  autoComplete="new-password"
                  required
                  aria-invalid={!!fieldErrors.newPassword}
                  aria-describedby={
                    fieldErrors.newPassword
                      ? "newPassword-error"
                      : "newPassword-help"
                  }
                  className={`w-full h-11 sm:h-12 pl-12 pr-12 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                    fieldErrors.newPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 transition-colors"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {fieldErrors.newPassword ? (
                <p
                  id="newPassword-error"
                  className="text-red-600 text-xs mt-1.5"
                >
                  {fieldErrors.newPassword}
                </p>
              ) : (
                <p
                  id="newPassword-help"
                  className="text-xs text-neutral-400 mt-1.5"
                >
                  Must be at least 8 characters and at most 72 bytes.
                </p>
              )}
            </div>
            {/* Confirm New Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm sm:text-base font-bold text-neutral-900 mb-2"
              >
                Confirm New Password
              </label>

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <Lock size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your new password"
                  autoComplete="new-password"
                  required
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirmPassword-error"
                      : undefined
                  }
                  className={`w-full h-11 sm:h-12 pl-12 pr-12 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p
                  id="confirmPassword-error"
                  className="text-red-600 text-xs mt-1.5"
                >
                  {fieldErrors.confirmPassword}
                </p>
              )}
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
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ChangePassword;
