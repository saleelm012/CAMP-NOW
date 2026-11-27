import { useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import api from "../../../axios/axios";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;
  const resetToken = location.state?.resetToken;

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (!email || !resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  const validateForm = () => {
    const errors = {};

    // New password validation
    if (!newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (new TextEncoder().encode(newPassword).length > 72) {
      errors.newPassword = "Password must not exceed 72 bytes";
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

  const handleReset = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    if (!validateForm()) return;

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        resetToken,
        newPassword,
      });

      navigate("/login", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "Password reset failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
          Reset <span className="text-[#8B1D2C]">Password</span>
        </h1>

        <p className="text-neutral-500 text-sm sm:text-base mb-8">
          Create a new password for your account.
        </p>

        <form onSubmit={handleReset} className="space-y-5" noValidate>
          {/* New Password */}

          <div>
            <label htmlFor="new-password" className="text-sm font-bold">
              New Password
            </label>

            <div className="relative mt-2">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);

                  setFieldErrors((prev) => ({
                    ...prev,
                    newPassword: "",
                    confirmPassword: "",
                  }));

                  setError("");
                }}
                aria-invalid={!!fieldErrors.newPassword}
                aria-describedby={
                  fieldErrors.newPassword ? "new-password-error" : undefined
                }
                className={`w-full h-12 pl-12 pr-12 border rounded-lg text-sm outline-none ${
                  fieldErrors.newPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-neutral-200 focus:border-neutral-900"
                }`}
              />

              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 cursor-pointer"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {fieldErrors.newPassword && (
              <p
                id="new-password-error"
                role="alert"
                className="text-red-600 text-xs mt-1.5"
              >
                {fieldErrors.newPassword}
              </p>
            )}
          </div>

          {/* Confirm Password */}

          <div>
            <label htmlFor="confirm-password" className="text-sm font-bold">
              Confirm Password
            </label>

            <div className="relative mt-2">
              <Lock
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
              />

              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);

                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: "",
                  }));

                  setError("");
                }}
                aria-invalid={!!fieldErrors.confirmPassword}
                aria-describedby={
                  fieldErrors.confirmPassword
                    ? "confirm-password-error"
                    : undefined
                }
                className={`w-full h-12 pl-12 pr-12 border rounded-lg text-sm outline-none ${
                  fieldErrors.confirmPassword
                    ? "border-red-500 focus:border-red-500"
                    : "border-neutral-200 focus:border-neutral-900"
                }`}
              />

              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Hide confirm password"
                    : "Show confirm password"
                }
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Confirm Password Error */}

            {fieldErrors.confirmPassword && (
              <p
                id="confirm-password-error"
                role="alert"
                className="text-red-600 text-xs mt-1.5"
              >
                {fieldErrors.confirmPassword}
              </p>
            )}
          </div>

          {/* General API Error */}

          {error && (
            <p role="alert" className="text-red-600 text-sm">
              {error}
            </p>
          )}

          {/* Submit Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#141414] text-white rounded-lg font-bold cursor-pointer hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </AuthLayout>
  );
}

export default ResetPassword;
