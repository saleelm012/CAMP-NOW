import express from "express";

import {
    registerUser,
    loginUser,
    verifyRegistrationOtp,
    resendRegistrationOtp,
    forgotPassword,
    verifyResetOtp,
    resetPassword,
    updateProfile,
    uploadProfileImage,
    logoutUser,
    changePassword,
    requestEmailChangeOtp,
    verifyEmailChangeOtp,
} from "../controllers/authcontroller.js";

import {
    loginLimiter,
    registerLimiter,
    otpVerifyLimiter,
    otpResendLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter
} from "../middlewares/rateLimitMiddleware.js";

import protect from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

import { googleLogin } from "../controllers/googleAuthController.js";

const router = express.Router();

// Registration
router.post("/register", registerLimiter, registerUser);

router.post(
    "/verify-otp",
    otpVerifyLimiter,
    verifyRegistrationOtp
);

router.post(
    "/resend-otp",
    otpResendLimiter,
    resendRegistrationOtp
);

// Login
router.post("/login", loginLimiter, loginUser);

router.post("/google", loginLimiter, googleLogin);

// Logout
router.post("/logout", logoutUser);

// Authenticated user
router.get("/me", protect, (req, res) => {
    res.status(200).json({
        message: "Authenticated user",
        user: req.user,
    });
});

// Forgot Password
router.post(
    "/forgot-password",
    forgotPasswordLimiter,
    forgotPassword
);

router.post(
    "/verify-reset-otp",
    otpVerifyLimiter,
    verifyResetOtp
);

router.post(
    "/reset-password",
    resetPasswordLimiter,
    resetPassword
);

// Update Profile
router.patch("/profile", protect, updateProfile);

// Change Password
router.patch("/change-password", protect, changePassword);

// Profile Image
router.patch(
    "/profile/image",
    protect,
    upload.single("profileImage"),
    uploadProfileImage
);

// Change Email
router.post(
    "/change-email/request-otp",
    protect,
    otpResendLimiter,
    requestEmailChangeOtp
);

router.post(
    "/change-email/verify-otp",
    protect,
    otpVerifyLimiter,
    verifyEmailChangeOtp
);

export default router;