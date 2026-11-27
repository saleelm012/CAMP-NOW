import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowLeft, RotateCcw } from "lucide-react";
import api from "../../../axios/axios";

function VerifyEmailChangeOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const newEmail = location.state?.newEmail;

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [otpError, setOtpError] = useState("");

  const inputRefs = useRef([]);

  // Auto-focus the first box on render if newEmail exists
  useEffect(() => {
    if (newEmail) {
      inputRefs.current[0]?.focus();
    }
  }, [newEmail]);

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
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasteData) {
      setOtpError("");
      setError("");
      const newOtp = pasteData.split("");
      while (newOtp.length < 6) newOtp.push("");
      setOtp(newOtp);
      inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading || !newEmail) return;

    setError("");
    setOtpError("");

    const otpString = otp.join("");

    // Empty OTP validation
    if (!otpString) {
      setOtpError("OTP is required");
      inputRefs.current[0]?.focus();
      return;
    }

    // OTP format validation
    if (!/^\d{6}$/.test(otpString)) {
      setOtpError("Enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/change-email/verify-otp", {
        otp: otpString,
      });

      alert(response.data.message);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      setError(error.response?.data?.message || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  if (!newEmail) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-neutral-200/90 rounded-2xl p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
            <Mail size={24} />
          </div>
          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Verification Required
          </h2>
          <p className="text-neutral-500 text-sm mb-6 leading-relaxed">
            Please request an email change OTP before accessing verification.
          </p>
          <button
            type="button"
            onClick={() => navigate("/profile/change-email")}
            className="inline-flex items-center justify-center w-full h-11 bg-[#141414] text-white rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            Change Email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Back Link */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => navigate("/profile/change-email")}
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to Change Email</span>
          </button>
        </div>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1">
            Verify New <span className="text-[#8B1D2C]">Email</span>
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Enter the 6-digit verification code sent to{" "}
            <strong className="text-neutral-900 font-semibold">
              {newEmail}
            </strong>
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
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
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
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

            {/* Error Alert */}
            {error && (
              <p
                role="alert"
                className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm font-medium"
              >
                {error}
              </p>
            )}

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 sm:h-13 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {/* Secondary Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/profile/change-email")}
                className="w-full sm:flex-1 h-11 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 shadow-xs flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={15} />
                <span>Resend OTP</span>
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => navigate("/profile")}
                className="w-full sm:flex-1 h-11 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 shadow-xs flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmailChangeOtp;
