import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import api from "../../../axios/axios";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [emailError, setEmailError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setEmailError("");

    const normalizedEmail = email.trim().toLowerCase();

    // Empty email validation
    if (!normalizedEmail) {
      setEmailError("Email is required");
      return;
    }

    // Email format validation
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      setEmailError("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      navigate("/verify-reset-otp", {
        state: { email: normalizedEmail },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
          Forgot <span className="text-[#8B1D2C]">Password?</span>
        </h1>

        <p className="text-neutral-500 text-sm sm:text-base mb-8">
          Enter your registered email address to receive a password reset OTP.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <label htmlFor="email" className="text-sm font-bold">
            Email Address
          </label>

          <div className="relative mt-2">
            <Mail
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />

            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              autoComplete="email"
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError("");
                setError("");
              }}
              aria-invalid={!!emailError}
              aria-describedby={emailError ? "email-error" : undefined}
              className={`w-full h-12 pl-12 pr-4 bg-white border rounded-lg text-sm outline-none ${
                emailError
                  ? "border-red-500 focus:border-red-500"
                  : "border-neutral-200 focus:border-neutral-900"
              }`}
              required
            />
          </div>

          {emailError && (
            <p
              id="email-error"
              role="alert"
              className="text-red-600 text-xs mt-1.5"
            >
              {emailError}
            </p>
          )}

          {error && (
            <p role="alert" className="text-red-600 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#141414] text-white rounded-lg font-bold cursor-pointer hover:bg-neutral-800 disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="text-[#8B1D2C] font-bold hover:underline cursor-pointer"
          >
            Back to Login
          </button>
        </p>
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
