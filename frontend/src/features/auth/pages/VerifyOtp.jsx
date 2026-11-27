import { useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState, useEffect, useRef } from "react";
import {
  verifyRegistrationOtp,
  resendRegistrationOtp,
} from "../../../services/authService";

function VerifyOtp() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [otpError, setOtpError] = useState("");

  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [cooldown, setCooldown] = useState(60);

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  // Auto-focus the first box on initial render
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleDigitChange = (index, value) => {
    setOtpError("");
    setError("");

    const cleanVal = value.replace(/\D/g, "");

    // If user pastes or types multiple digits
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split("");
      const newOtp = [...otp];
      pastedDigits.forEach((digit, i) => {
        if (index + i < 6) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      const nextIdx = Math.min(index + pastedDigits.length, 5);
      inputRefs.current[nextIdx]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleanVal;
    setOtp(newOtp);

    // Auto-advance to next box when a digit is entered
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        // If current box is already empty, jump to previous box
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current box
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasteData) {
      const newOtp = pasteData.split("");
      while (newOtp.length < 6) newOtp.push("");
      setOtp(newOtp);
      inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || resendLoading) return;

    setError("");
    setOtpError("");
    setSuccess("");

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    const otpString = otp.join("");

    // Empty OTP validation
    if (!otpString) {
      setOtpError("OTP is required");
      inputRefs.current[0]?.focus();
      return;
    }

    // Invalid OTP validation
    if (!/^\d{6}$/.test(otpString)) {
      setOtpError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await verifyRegistrationOtp(email, otpString);

      navigate("/login", {
        replace: true,
        state: {
          message: "Email verified successfully! Please login.",
        },
      });
    } catch (err) {
      setError(err.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleResendOtp = async () => {
    if (!email || cooldown > 0 || resendLoading || loading) {
      return;
    }

    setError("");
    setOtpError("");
    setSuccess("");

    try {
      setResendLoading(true);

      const response = await resendRegistrationOtp(email);

      setSuccess(response.message || "New OTP sent successfully!");

      setOtp(["", "", "", "", "", ""]);
      setCooldown(60);

      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };
  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-2">
          Verify Your Email
        </h1>

        <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-8">
          We have sent a verification code to
          <strong className="text-neutral-900 font-semibold">
            {" "}
            {email || "your email address"}
          </strong>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-3">
              Enter OTP
            </label>

            {/* 6-box OTP Model */}
            <div
              className="flex items-center justify-between gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  autoComplete={idx === 0 ? "one-time-code" : "off"}
                  aria-label={`Digit ${idx + 1}`}
                  aria-invalid={!!otpError}
                  aria-describedby={otpError ? "otp-error" : undefined}
                  className={`w-11 h-13 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold bg-white border rounded-lg sm:rounded-xl text-neutral-900 outline-none transition-all duration-200 shadow-xs ${
                    otpError
                      ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
                  }`}
                />
              ))}
            </div>

            {otpError && (
              <p
                id="otp-error"
                role="alert"
                className="text-red-600 text-xs mt-2"
              >
                {otpError}
              </p>
            )}
          </div>

          {error && (
            <p
              role="alert"
              className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm font-medium"
            >
              {error}
            </p>
          )}

          {success && (
            <p
              role="status"
              className="text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-lg text-sm font-medium"
            >
              {success}
            </p>
          )}

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-13 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={cooldown > 0 || resendLoading || !email}
              className="w-full h-12 sm:h-13 bg-white text-neutral-800 border border-neutral-200 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {resendLoading
                ? "Sending..."
                : cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default VerifyOtp;
