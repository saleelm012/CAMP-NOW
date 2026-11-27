import { replace, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { useState } from "react";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { registerUser } from "../../../services/authService";

function Register() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setFieldErrors((prev) => ({
      ...prev,
      [name]: "",
      ...(name === "password" ? { confirmPassword: "" } : {}),
    }));

    setError("");
  };

  const validateForm = () => {
    const errors = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Name is required";
    } else if (
      formData.name.trim().length < 2 ||
      formData.name.trim().length > 100
    ) {
      errors.name = "Name must be between 2 and 100 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (
      formData.email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
    ) {
      errors.email = "Enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
      errors.phone = "Enter a valid 10-digit phone number";
    }

    // Password validation
    if (!formData.password.trim()) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must contain at least 8 characters";
    } else if (new TextEncoder().encode(formData.password).length > 72) {
      errors.password = "Password must not exceed 72 bytes";
    }

    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      errors.confirmPassword = "Confirm password is required";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    setMessage("");
    setError("");

    // Frontend validation
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      };

      const response = await registerUser(userData);

      navigate("/verify-otp", {
        replace: true,
        state: {
          email: response.email || formData.email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-lg mx-auto">
        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
          <span className="text-black">Create </span>
          <span className="text-[#8B1D2C]">Account</span>
        </h1>
        <p className="text-neutral-500 text-sm sm:text-base mb-8">
          Join Football Store and explore your style.
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 sm:space-y-5"
        >
          {/* Name */}
          <div className="flex items-start gap-3 sm:gap-5">
            <label
              htmlFor="name"
              className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900 pt-3"
            >
              Name
            </label>

            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <User size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  aria-invalid={!!fieldErrors.name}
                  aria-describedby={fieldErrors.name ? "name-error" : undefined}
                  className={`w-full h-11 sm:h-12 pl-12 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 ${
                    fieldErrors.name
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />
              </div>

              {fieldErrors.name && (
                <p id="name-error" className="text-red-600 text-xs mt-1.5">
                  {fieldErrors.name}
                </p>
              )}
            </div>
          </div>
          {/* Email */}
          <div className="flex items-start gap-3 sm:gap-5">
            <label
              htmlFor="email"
              className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900 pt-3"
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
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
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

          {/* Phone */}
          <div className="flex items-start gap-3 sm:gap-5">
            <label
              htmlFor="phone"
              className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900 pt-3"
            >
              Phone
            </label>

            <div className="flex-1 min-w-0">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                  <Phone size={19} strokeWidth={1.8} />
                </div>

                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                  required
                  aria-invalid={!!fieldErrors.phone}
                  aria-describedby={
                    fieldErrors.phone ? "phone-error" : undefined
                  }
                  className={`w-full h-11 sm:h-12 pl-12 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 ${
                    fieldErrors.phone
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />
              </div>

              {fieldErrors.phone && (
                <p id="phone-error" className="text-red-600 text-xs mt-1.5">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex items-start gap-3 sm:gap-5">
            <label
              htmlFor="password"
              className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900 pt-3"
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
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

          {/* Confirm Password */}
          <div className="flex items-start gap-3 sm:gap-5">
            <label
              htmlFor="confirmPassword"
              className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900 pt-3"
            >
              Confirm Password
            </label>

            <div className="flex-1 min-w-0">
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
                  placeholder="Confirm your password"
                  required
                  aria-invalid={!!fieldErrors.confirmPassword}
                  aria-describedby={
                    fieldErrors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  className={`w-full h-11 sm:h-12 pl-12 pr-12 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 ${
                    fieldErrors.confirmPassword
                      ? "border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                      : "border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                  }`}
                />

                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer p-1 transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
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
                  id="confirm-password-error"
                  className="text-red-600 text-xs mt-1.5"
                >
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Feedback Messages */}
          {error && (
            <p className="text-red-600 bg-red-50 border border-red-200 px-4 py-2.5 rounded-lg text-sm">
              {error}
            </p>
          )}

          {message && (
            <p className="text-green-700 bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg text-sm">
              {message}
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-colors duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <p className="text-center text-sm sm:text-base text-neutral-500 mt-6">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[#8B1D2C] hover:text-[#6e1623] font-bold no-underline hover:underline"
          >
            Login
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}

export default Register;
