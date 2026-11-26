import { replace, useNavigate } from 'react-router-dom';
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
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

navigate('/verify-otp', {
  replace:true,
    state: {
        email: response.email || formData.email.trim().toLowerCase()
    }
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

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* Name */}
          <div className="flex items-center gap-3 sm:gap-5">
            <label className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900">
              Name
            </label>
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                <User size={19} strokeWidth={1.8} />
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="w-full h-11 sm:h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 sm:gap-5">
            <label className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900">
              Email
            </label>
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                <Mail size={19} strokeWidth={1.8} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="w-full h-11 sm:h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center gap-3 sm:gap-5">
            <label className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900">
              Phone
            </label>
            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                <Phone size={19} strokeWidth={1.8} />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                className="w-full h-11 sm:h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center gap-3 sm:gap-5">
            <label className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900">
              Password
            </label>

            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                <Lock size={19} strokeWidth={1.8} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
                className="w-full h-11 sm:h-12 pl-12 pr-12 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
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
          </div>

          {/* Confirm Password */}
          <div className="flex items-center gap-3 sm:gap-5">
            <label className="w-32 sm:w-40 shrink-0 text-sm sm:text-base font-bold text-neutral-900">
              Confirm Password
            </label>

            <div className="relative flex-1">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                <Lock size={19} strokeWidth={1.8} />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                className="w-full h-11 sm:h-12 pl-12 pr-12 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
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
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
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
