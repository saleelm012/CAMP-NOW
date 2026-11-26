import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    message: "Too many login attempts. Please try again after 15 minutes.",
  },
});
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many registration attempts. Please try again after 15 minutes.",
  },
});
const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many OTP verification attempts. Please try again later.",
  },
});
const otpResendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many OTP requests. Please try again later.",
  },
});
const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset requests. Please try again later.",
  },
});
const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset attempts. Please try again later.",
  },
});

export {
  loginLimiter,
  registerLimiter,
  otpVerifyLimiter,
  otpResendLimiter,
  forgotPasswordLimiter,
  resetPasswordLimiter
};
