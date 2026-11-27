import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import { Mail, Lock, Eye, EyeOff, Phone } from "lucide-react";
import { loginUser } from "../../../services/authService";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";

import NavigationButton from "../../../components/NavigationButton";

import api from "../../../axios/axios";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const [success, setSuccess] = useState("");

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const [googleCredential, setGoogleCredential] = useState("");
  const [requiresPhone, setRequiresPhone] = useState(false);
  const [phone, setPhone] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const validateLoginForm = () => {
    const errors = {};

    // Email validation
    if (!email.trim()) {
      errors.email = "Email is required";
    } else if (
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      errors.email = "Enter a valid email address";
    }

    // Password validation
    if (!password.trim()) {
      errors.password = "Password is required";
    } else if (new TextEncoder().encode(password).length > 72) {
      errors.password = "Password must not exceed 72 bytes";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (loading || googleLoading || isLoggedIn || requiresPhone) {
      return;
    }

    setError("");
    setSuccess("");

    // Frontend validation
    if (!validateLoginForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await loginUser(email.trim().toLowerCase(), password);

      setSuccess(response.message || "Login successful!");

      setIsLoggedIn(true);
      setEmail("");
      setPassword("");

      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse) => {
    setError("");
    setSuccess("");
    setRequiresPhone(false);
    setGoogleCredential("");
    setPhone("");

    try {
      setGoogleLoading(true);

      const response = await api.post("/auth/google", {
        credential: credentialResponse.credential,
      });

      console.log("Google response:", response.data);

      if (response.data.requiresPhone) {
        setGoogleCredential(credentialResponse.credential);
        setRequiresPhone(true);

        return;
      }

      setSuccess(response.data.message);
      setIsLoggedIn(true);

      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGooglePhoneSubmit = async () => {
    if (googleLoading || loading || isLoggedIn) return;

    setError("");
    setSuccess("");
    setFieldErrors({});

    // Phone validation
    if (!phone.trim()) {
      setFieldErrors({
        phone: "Phone number is required",
      });
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setFieldErrors({
        phone: "Enter a valid 10-digit phone number",
      });
      return;
    }

    try {
      setGoogleLoading(true);

      const response = await api.post("/auth/google", {
        credential: googleCredential,
        phone: phone.trim(),
      });

      setSuccess(response.data.message);

      setGoogleCredential("");
      setRequiresPhone(false);
      setPhone("");
      setIsLoggedIn(true);

      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Google registration failed");

      if (err.response?.status === 401) {
        setGoogleCredential("");
        setRequiresPhone(false);
        setPhone("");
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          <span className="text-black">Welcome </span>
          <span className="text-[#8B1D2C]">Back</span>
        </h1>
        <p className="text-neutral-500 text-sm sm:text-base mb-8">
          Login to your Football Store account.
        </p>

        <form
          onSubmit={handleLogin}
          noValidate
          className="space-y-4 sm:space-y-5"
        >
          {/* Email */}
          <div className="flex items-start gap-3 sm:gap-5">
            <label
              htmlFor="email"
              className="w-24 sm:w-28 shrink-0 text-sm sm:text-base font-bold text-neutral-900 pt-3"
            >
              Email
            </label>

            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <Mail size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    setFieldErrors((prev) => ({
                      ...prev,
                      email: "",
                    }));

                    setError("");
                  }}
                  required
                  aria-invalid={!!fieldErrors.email}
                  aria-describedby={
                    fieldErrors.email ? "email-error" : undefined
                  }
                  className={`w-full h-11 sm:h-12 pl-12 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 ${
                    fieldErrors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />
              </div>

              {fieldErrors.email && (
                <p id="email-error" className="text-red-600 text-xs mt-1.5">
                  {fieldErrors.email}
                </p>
              )}
            </div>
          </div>
          {/* Password */}
          <div className="flex items-start gap-3 sm:gap-5">
            <label
              htmlFor="password"
              className="w-24 sm:w-28 shrink-0 text-sm sm:text-base font-bold text-neutral-900 pt-3"
            >
              Password
            </label>

            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <Lock size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);

                    setFieldErrors((prev) => ({
                      ...prev,
                      password: "",
                    }));

                    setError("");
                  }}
                  required
                  aria-invalid={!!fieldErrors.password}
                  aria-describedby={
                    fieldErrors.password ? "password-error" : undefined
                  }
                  className={`w-full h-11 sm:h-12 pl-12 pr-12 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 ${
                    fieldErrors.password
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />

                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {fieldErrors.password && (
                <p id="password-error" className="text-red-600 text-xs mt-1.5">
                  {fieldErrors.password}
                </p>
              )}
            </div>
          </div>

          {/* Login Options */}
          <div className="flex justify-between items-center text-sm pt-1">
            <label className="flex items-center gap-2 text-neutral-700 cursor-pointer select-none">
              <input
                type="checkbox"
                className="cursor-pointer accent-neutral-900 w-4 h-4 rounded"
              />
              <span>Remember me</span>
            </label>

            <NavigationButton
              to="/forgot-password"
              className="text-neutral-700 hover:text-neutral-900 font-semibold no-underline hover:underline"
            >
              Forgot Password?
            </NavigationButton>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            {/* Login Error Message */}
            {error && (
              <p role="alert" className="text-red-600 text-sm">
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

            <button
              type="submit"
              disabled={loading || isLoggedIn || googleLoading || requiresPhone}
              className="w-full h-12 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-neutral-800 shadow-sm disabled:opacity-60"
            >
              {loading ? "Logging in..." : isLoggedIn ? "Logged In" : "Login"}
            </button>

            {/* Social Divider */}
            {!requiresPhone && (
              <div className="relative my-4 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative bg-white px-3 text-xs uppercase font-semibold text-neutral-400 tracking-wider">
                  Or continue with
                </div>
              </div>
            )}

            {requiresPhone ? (
              <div className="space-y-4 border border-neutral-200/90 rounded-2xl p-5 sm:p-6 bg-neutral-50/50 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-neutral-900 text-base">
                    Complete Your Account
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                    Enter your 10-digit mobile number to complete Google
                    Sign-In.
                  </p>
                </div>

                <div>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                      <Phone size={18} strokeWidth={1.8} />
                    </div>

                    <input
                      id="google-phone"
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      value={phone}
                      maxLength={10}
                      aria-label="Phone number"
                      aria-invalid={!!fieldErrors.phone}
                      aria-describedby={
                        fieldErrors.phone ? "google-phone-error" : undefined
                      }
                      onChange={(e) => {
                        setPhone(e.target.value);

                        setFieldErrors((prev) => ({
                          ...prev,
                          phone: "",
                        }));

                        setError("");
                      }}
                      className={`w-full h-11 sm:h-12 pl-11 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                        fieldErrors.phone
                          ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                      }`}
                    />
                  </div>

                  {fieldErrors.phone && (
                    <p
                      id="google-phone-error"
                      className="text-red-600 text-xs mt-1.5"
                    >
                      {fieldErrors.phone}
                    </p>
                  )}
                </div>
                <div className="flex flex-col-reverse sm:flex-row gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={googleLoading}
                    onClick={() => {
                      setRequiresPhone(false);
                      setGoogleCredential("");
                      setPhone("");
                      setError("");
                    }}
                    className="w-full sm:w-auto sm:px-5 h-11 bg-white border border-neutral-200 text-neutral-700 rounded-lg text-sm font-semibold cursor-pointer hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleGooglePhoneSubmit}
                    disabled={googleLoading || loading}
                    className="w-full sm:flex-1 h-11 bg-[#141414] text-white rounded-lg text-sm font-bold cursor-pointer transition-colors hover:bg-neutral-800 disabled:opacity-60 shadow-xs flex items-center justify-center gap-2"
                  >
                    {googleLoading ? "Please wait..." : "Continue"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center justify-center pt-1">
                {!googleLoading && !loading && !isLoggedIn && (
                  <div className="w-full flex justify-center [&>div]:max-w-full">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => {
                        setSuccess("");
                        setError("Google login failed");
                      }}
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="rectangular"
                      logo_alignment="left"
                      width="380"
                    />
                  </div>
                )}

                {googleLoading && (
                  <div className="flex items-center justify-center gap-2 text-sm font-medium text-neutral-600 py-2">
                    <div className="w-4 h-4 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Google account...</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm sm:text-base text-neutral-500 mt-6">
          Don't have an account?{" "}
          <a
            href="/register"
            className="text-[#8B1D2C] hover:text-[#6e1623] font-bold no-underline hover:underline"
          >
            Create Account
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Login;
