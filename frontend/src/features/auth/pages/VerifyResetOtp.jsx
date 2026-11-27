import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import api from "../../../axios/axios";

function VerifyResetOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [otpError, setOtpError] = useState("");

  const inputRefs = useRef([]);

  // Auto-focus the first box on initial render
  useEffect(() => {
    if (email) {
      inputRefs.current[0]?.focus();
    }
  }, [email]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

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
      setOtpError("");
      setError("");
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

    setOtpError("");
    setError("");
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

  const handleVerify = async (e) => {
    e.preventDefault();

    if (loading) return;

    setError("");
    setOtpError("");

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

      const response = await api.post("/auth/verify-reset-otp", {
        email,
        otp: otpString,
      });

      navigate("/reset-password", {
        state: {
          email,
          resetToken: response.data.resetToken,
        },
        replace: true,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || err.message || "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 mb-2">
          Verify <span className="text-[#8B1D2C]">OTP</span>
        </h1>

        <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-8">
          Enter the 6-digit verification code sent to{" "}
          <strong className="text-neutral-900 font-semibold">{email}</strong>
        </p>

        {/* Form */}
        <form onSubmit={handleVerify} className="space-y-6" noValidate>
          <div>
            <label className="block text-sm sm:text-base font-bold text-neutral-900 mb-3">
              Verification Code
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

          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-13 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-bold text-[#8B1D2C] hover:underline cursor-pointer transition-all pt-2"
            >
              <ArrowLeft size={16} />
              <span>Back to Forgot Password</span>
            </button>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}

export default VerifyResetOtp;
