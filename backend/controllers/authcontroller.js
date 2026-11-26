import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import PendingRegistration from "../models/PendingRegistration.js";
import generateOtp from "../utils/generateOtp.js";
import hashOtp from "../utils/hashOtp.js";
import sendOtpEmail from "../services/emailService.js";
import mongoose from "mongoose";

import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

const registerUser = async (req, res) => {
  try {
    // console.log('third route');

    const { name, email, password, phone } = req.body;

    // Check required fields
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: phone.trim() }],
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email or phone already exists",
      });
    }

    // Find existing pending registration
    const pendingUser = await PendingRegistration.findOne({
      email: normalizedEmail,
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOtp();

    // Hash OTP
    const hashedOtp = await hashOtp(otp);

    // OTP expires after 5 minutes
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Save pending registration
    // Save or update pending registration
    const now = new Date();

    const cooldownTime = new Date(now.getTime() - 60 * 1000);

    if (!pendingUser) {
      // New pending registration
      await PendingRegistration.create({
        name,
        email: normalizedEmail,
        phone: phone.trim(),
        passwordHash: hashedPassword,
        otpHash: hashedOtp,
        otpExpiresAt,
        otpAttempts: 0,
        otpLastSentAt: now,
      });
    } else {
      // Existing pending registration
      const result = await PendingRegistration.updateOne(
        {
          _id: pendingUser._id,
          verificationStatus: "pending",
          $or: [
            { otpLastSentAt: null },
            { otpLastSentAt: { $lte: cooldownTime } },
          ],
        },
        {
          $set: {
            name,
            phone: phone.trim(),
            passwordHash: hashedPassword,
            otpHash: hashedOtp,
            otpExpiresAt,
            otpAttempts: 0,
            otpLastSentAt: now,
          },
        },
      );

      if (result.modifiedCount === 0) {
        return res.status(429).json({
          message: "Please wait before requesting another OTP",
        });
      }
    }

    // Send OTP to user's email
    await sendOtpEmail(normalizedEmail, otp);

    // Send response to frontend
    return res.status(200).json({
      message: "OTP sent successfully. Please verify your email.",
      email: normalizedEmail,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email or phone already exists",
      });
    }

    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyRegistrationOtp = async (req, res) => {
  let session;

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const pendingUser = await PendingRegistration.findOne({
      email: normalizedEmail,
    });

    if (!pendingUser) {
      return res.status(400).json({
        message: "No pending registration found",
      });
    }
    // Check OTP expiry
    if (pendingUser.otpExpiresAt.getTime() <= Date.now()) {
      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Check maximum OTP attempts
    if (pendingUser.otpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many incorrect attempts. Please request a new OTP.",
      });
    }

    // Compare entered OTP with stored hashed OTP
    const isOtpValid = await bcrypt.compare(String(otp), pendingUser.otpHash);

    // If OTP is incorrect
    if (!isOtpValid) {
      const result = await PendingRegistration.updateOne(
        {
          _id: pendingUser._id,
          otpAttempts: { $lt: 5 },
          otpHash: pendingUser.otpHash,
          otpExpiresAt: { $gt: new Date() },
        },
        {
          $inc: { otpAttempts: 1 },
        },
      );

      if (result.modifiedCount === 0) {
        return res.status(429).json({
          message: "OTP expired, changed, or attempt limit reached",
        });
      }

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    session = await mongoose.startSession();

    let user = null;

    await session.withTransaction(async () => {
      // Atomically claim OTP verification
      const claimedUser = await PendingRegistration.findOneAndUpdate(
        {
          _id: pendingUser._id,
          verificationStatus: "pending",
          otpHash: pendingUser.otpHash,
          otpAttempts: { $lt: 5 },
          otpExpiresAt: { $gt: new Date() },
        },
        {
          $set: {
            verificationStatus: "processing",
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!claimedUser) {
        const error = new Error(
          "OTP verification cannot be completed. Please try again.",
        );

        error.statusCode = 409;

        throw error;
      }

      // Create verified user
      const [createdUser] = await User.create(
        [
          {
            name: pendingUser.name,
            email: pendingUser.email,
            phone: pendingUser.phone,
            password: pendingUser.passwordHash,
            isEmailVerified: true,
          },
        ],
        { session },
      );

      user = createdUser;

      // Delete temporary registration
      const deleteResult = await PendingRegistration.deleteOne(
        { _id: pendingUser._id },
        { session },
      );

      if (deleteResult.deletedCount !== 1) {
        throw new Error("Pending registration deletion failed");
      }
    });

    // Send success response
    return res.status(201).json({
      message: "Email verified. Registration successful!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(error.statusCode || 500).json({
      message: error.statusCode ? error.message : "Internal server error",
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

const resendRegistrationOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const pendingUser = await PendingRegistration.findOne({
      email: normalizedEmail,
    });

    if (!pendingUser) {
      return res.status(400).json({
        message: "No pending registration found",
      });
    }

    // Generate a new OTP
    const otp = generateOtp();

    // Hash the new OTP
    const hashedOtp = await hashOtp(otp);

    // Set new OTP expiry time
    const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // Atomic cooldown check and OTP update
    const now = new Date();

    const cooldownTime = new Date(now.getTime() - 60 * 1000);

    const result = await PendingRegistration.updateOne(
      {
        _id: pendingUser._id,
        verificationStatus: "pending",
        $or: [
          { otpLastSentAt: null },
          { otpLastSentAt: { $lte: cooldownTime } },
        ],
      },

      {
        $set: {
          otpHash: hashedOtp,
          otpExpiresAt,
          otpAttempts: 0,
          otpLastSentAt: now,
        },
      },
    );

    if (result.modifiedCount === 0) {
      return res.status(429).json({
        message: "Please wait before resending OTP",
      });
    }

    // Send new OTP to user's email
    await sendOtpEmail(normalizedEmail, otp);

    // Send success response
    return res.status(200).json({
      message: "New OTP sent successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (
      !user ||
      user.role !== "user" ||
      user.authProvider === "google" ||
      !user.password
    ) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "invalid email or password",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Your account has been blocked. Please contact support.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        tokenVersion: user.tokenVersion ?? 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        audience: "camp-nou-customer",
      },
    );

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "login successfull",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "internel server error",
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
   const { email } = req.body || {};

    // Validate email
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const message = "If the email is registered, an OTP will be sent.";

    // Find registered user
    const user = await User.findOne({
      email: normalizedEmail,
      role: "user",
      isActive: true,
      isEmailVerified: true,
      authProvider: { $ne: "google" },
    });

    if (!user) {
      return res.status(200).json({ message });
    }

    // Generate and hash OTP
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    const now = Date.now();

    // Save OTP with 5-minute expiry and 60-second cooldown
    const result = await User.updateOne(
      {
        _id: user._id,
        role: "user",
        isActive: true,
        isEmailVerified: true,
        authProvider: { $ne: "google" },
        $or: [
          { resetOtpExpires: null },
          {
            resetOtpExpires: {
              $lte: new Date(now + 4 * 60 * 1000),
            },
          },
        ],
      },
      {
        $set: {
          resetOtpHash: hashedOtp,
          resetOtpExpires: new Date(now + 5 * 60 * 1000),
          resetOtpAttempts: 0,
        },
        $unset: {
          resetTokenHash: 1,
          resetTokenExpires: 1,
        },
      },
    );

    if (result.modifiedCount === 0) {
      return res.status(200).json({ message });
    }

    // Send OTP to email
    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({ message });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (
      typeof email !== "string" ||
      !email.trim() ||
      !/^\d{6}$/.test(String(otp))
    ) {
      return res.status(400).json({
        message: "Valid email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await User.findOne({
      email: normalizedEmail,
      role: "user",
      isActive: true,
      isEmailVerified: true,
      authProvider: { $ne: "google" },
    }).select("+resetOtpHash");

    if (!user || !user.resetOtpHash) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    // Check OTP expiry
    if (!user.resetOtpExpires || user.resetOtpExpires.getTime() <= Date.now()) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Check maximum attempts
    if (user.resetOtpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Request a new OTP.",
      });
    }

    // Compare OTP
    const isOtpValid = await bcrypt.compare(String(otp), user.resetOtpHash);

    const otpFilter = {
      _id: user._id,
      role: "user",
      isActive: true,
      isEmailVerified: true,
      authProvider: { $ne: "google" },
      resetOtpHash: user.resetOtpHash,
      resetOtpExpires: { $gt: new Date() },
      resetOtpAttempts: { $lt: 5 },
    };

    // Incorrect OTP
    if (!isOtpValid) {
      await User.updateOne(otpFilter, { $inc: { resetOtpAttempts: 1 } });

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash reset token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Save reset token and invalidate OTP
    const result = await User.updateOne(otpFilter, {
      $set: {
        resetTokenHash,
        resetTokenExpires: new Date(Date.now() + 10 * 60 * 1000),
        resetOtpAttempts: 0,
      },
      $unset: {
        resetOtpHash: 1,
        resetOtpExpires: 1,
      },
    });

    if (result.modifiedCount !== 1) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    // Validate inputs
    if (
      typeof email !== "string" ||
      !email.trim() ||
      typeof resetToken !== "string" ||
      !/^[a-f0-9]{64}$/.test(resetToken) ||
      typeof newPassword !== "string"
    ) {
      return res.status(400).json({
        message: "Valid email, token and password are required",
      });
    }

    // Password validation
    if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and at most 72 bytes",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Hash received reset token
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Find user with valid reset token
    const user = await User.findOne({
      email: normalizedEmail,
      role: "user",
      resetTokenHash,
      resetTokenExpires: { $gt: new Date() },
      isActive: true,
      isEmailVerified: true,
      authProvider: { $ne: "google" },
    });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and invalidate reset token
    const result = await User.updateOne(
      {
        _id: user._id,
        role: "user",
        resetTokenHash,
        resetTokenExpires: { $gt: new Date() },
        isActive: true,
        isEmailVerified: true,
        authProvider: { $ne: "google" },
      },
      {
        $set: {
          password: hashedPassword,
          resetOtpAttempts: 0,
        },
        $inc: {
          tokenVersion: 1,
        },
        $unset: {
          resetTokenHash: 1,
          resetTokenExpires: 1,
          resetOtpHash: 1,
          resetOtpExpires: 1,
          pendingEmail: 1,
          emailChangeOtpHash: 1,
          emailChangeOtpExpires: 1,
        },
      },
    );

    if (result.modifiedCount !== 1) {
      return res.status(400).json({
        message: "Invalid or expired reset token",
      });
    }

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const userId = req.user._id;

    // Required field validation
    if (
      typeof name !== "string" ||
      typeof phone !== "string" ||
      !name.trim() ||
      !phone.trim()
    ) {
      return res.status(400).json({
        message: "Name and phone number are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedPhone = phone.trim();

    // Phone number validation
    if (!/^[6-9]\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({
        message: "Enter a valid phone number",
      });
    }

    // Check duplicate phone number
    const existingUser = await User.findOne({
      phone: normalizedPhone,
      _id: { $ne: userId },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Phone number already in use",
      });
    }

    // Update user details
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        name: normalizedName,
        phone: normalizedPhone,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("name email phone role isActive isEmailVerified");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Phone number already in use",
      });
    }

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
};

const uploadProfileImage = async (req, res) => {
  let savedFile;

  try {
    const userId = req.user._id;

    // Check whether image is uploaded
    if (!req.file) {
      return res.status(400).json({
        message: "Please select an image",
      });
    }

    // Process and validate image
    let processedImage;

    try {
      const image = sharp(req.file.buffer, {
        limitInputPixels: 20000000,
      });

      const metadata = await image.metadata();

      if (!["jpeg", "png", "webp"].includes(metadata.format)) {
        return res.status(400).json({
          message: "Invalid image format",
        });
      }

      processedImage = await image
        .rotate()
        .resize(400, 400, {
          fit: "cover",
        })
        .webp({ quality: 80 })
        .toBuffer();
    } catch (error) {
      return res.status(400).json({
        message: "Invalid or corrupted image",
      });
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "uploads", "profiles");

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    // Generate unique filename
    const filename = `${randomUUID()}.webp`;

    const filePath = path.join(uploadDir, filename);

    // Save processed image
    await fs.writeFile(filePath, processedImage);

    savedFile = filePath;

    const imagePath = `/uploads/profiles/${filename}`;

    // Update MongoDB
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profileImage: imagePath,
      },
      {
        returnDocument: "after",
        runValidators: true,
      },
    ).select("name email phone profileImage");

    if (!updatedUser) {
      await fs.unlink(savedFile).catch(() => {});

      return res.status(404).json({
        message: "User not found",
      });
    }

    savedFile = null;

    return res.status(200).json({
      message: "Profile image updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    if (savedFile) {
      await fs.unlink(savedFile).catch(() => {});
    }

    return res.status(500).json({
      message: "Failed to upload profile image",
    });
  }
};

const logoutUser = (req, res) => {
  try {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const userId = req.user._id;

    // Required field validation
    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "All password fields are required",
      });
    }

    // New password length validation
    if (newPassword.length < 8 || Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must be at least 8 characters and at most 72 bytes",
      });
    }

    // Confirm password validation
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // Prevent using the same password
    if (currentPassword === newPassword) {
      return res.status(400).json({
        message: "New password must be different from current password",
      });
    }

    // Find authenticated user
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.authProvider === "google" || !user.password) {
      return res.status(403).json({
        message: "Password change is not available for Google accounts",
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const result = await User.updateOne(
      {
        _id: userId,
        password: user.password,
        isActive: true,
      },
      {
        $set: {
          password: hashedPassword,
        },
        $inc: {
          tokenVersion: 1,
        },
        $unset: {
          resetOtpHash: 1,
          resetOtpExpires: 1,
          resetTokenHash: 1,
          resetTokenExpires: 1,
          pendingEmail: 1,
          emailChangeOtpHash: 1,
          emailChangeOtpExpires: 1,
        },
      },
    );

    if (result.modifiedCount !== 1) {
      return res.status(409).json({
        message: "Password update failed. Please try again.",
      });
    }

    // Clear authentication cookie
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const requestEmailChangeOtp = async (req, res) => {
  try {
    const { newEmail, currentPassword } = req.body;

    // Validate email
    if (
      typeof newEmail !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail.trim())
    ) {
      return res.status(400).json({
        message: "Valid email is required",
      });
    }

    const normalizedEmail = newEmail.trim().toLowerCase();

    // Find logged-in user
    const user = await User.findById(req.user._id).select("+password");

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    if (user.authProvider === "google" || !user.password) {
      return res.status(403).json({
        message: "Email change is not available for Google accounts",
      });
    }

    // Verify current password
    if (
      typeof currentPassword !== "string" ||
      !(await bcrypt.compare(currentPassword, user.password))
    ) {
      return res.status(400).json({
        message: "Incorrect current password",
      });
    }

    // Check current email
    if (user.email === normalizedEmail) {
      return res.status(400).json({
        message: "New email cannot be the same as current email",
      });
    }

    // Check whether email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Generate and hash OTP
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    const now = Date.now();

    // Save pending email and OTP
    const result = await User.updateOne(
      {
        _id: user._id,
        isActive: true,
        password: user.password,
        email: user.email,
        $or: [
          { emailChangeOtpLastSentAt: null },
          {
            emailChangeOtpLastSentAt: {
              $lte: new Date(now - 60 * 1000),
            },
          },
        ],
      },
      {
        $set: {
          pendingEmail: normalizedEmail,
          emailChangeOtpHash: hashedOtp,
          emailChangeOtpExpires: new Date(now + 5 * 60 * 1000),
          emailChangeOtpAttempts: 0,
          emailChangeOtpLastSentAt: new Date(now),
        },
      },
    );

    if (result.modifiedCount !== 1) {
      return res.status(429).json({
        message: "Please wait before requesting another OTP",
      });
    }

    // Send OTP to new email
    await sendOtpEmail(normalizedEmail, otp);

    return res.status(200).json({
      message: "OTP sent to your new email successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const verifyEmailChangeOtp = async (req, res) => {
  try {
    const { otp } = req.body;

    // Validate OTP
    if (!/^\d{6}$/.test(String(otp))) {
      return res.status(400).json({
        message: "Valid OTP is required",
      });
    }

    // Find logged-in user
    const user = await User.findById(req.user._id).select(
      "+emailChangeOtpHash",
    );

    if (
      !user ||
      !user.isActive ||
      user.authProvider === "google" ||
      !user.pendingEmail ||
      !user.emailChangeOtpHash
    ) {
      return res.status(400).json({
        message: "Invalid email change request",
      });
    }
    // Check OTP expiry
    if (
      !user.emailChangeOtpExpires ||
      user.emailChangeOtpExpires.getTime() <= Date.now()
    ) {
      return res.status(400).json({
        message: "OTP has expired",
      });
    }

    // Check maximum attempts
    if (user.emailChangeOtpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Request a new OTP",
      });
    }

    // Compare OTP
    const isOtpValid = await bcrypt.compare(
      String(otp),
      user.emailChangeOtpHash,
    );

    const otpFilter = {
      _id: user._id,
      isActive: true,
      authProvider: { $ne: "google" },
      tokenVersion: user.tokenVersion,
      email: user.email,
      pendingEmail: user.pendingEmail,
      emailChangeOtpHash: user.emailChangeOtpHash,
      emailChangeOtpExpires: { $gt: new Date() },
      emailChangeOtpAttempts: { $lt: 5 },
    };

    // Incorrect OTP
    if (!isOtpValid) {
      await User.updateOne(otpFilter, { $inc: { emailChangeOtpAttempts: 1 } });

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // Check duplicate email
    const existingUser = await User.findOne({
      email: user.pendingEmail,
      _id: { $ne: user._id },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    // Update actual email
    const result = await User.updateOne(otpFilter, {
      $set: {
        email: user.pendingEmail,
        isEmailVerified: true,
        emailChangeOtpAttempts: 0,
      },
      $unset: {
        pendingEmail: 1,
        emailChangeOtpHash: 1,
        emailChangeOtpExpires: 1,
        resetOtpHash: 1,
        resetOtpExpires: 1,
        resetTokenHash: 1,
        resetTokenExpires: 1,
      },
      $inc: {
        tokenVersion: 1,
      },
    });

    if (result.modifiedCount !== 1) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return res.status(200).json({
      message: "Email updated successfully. Please login again.",
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export {
  registerUser,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  loginUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  updateProfile,
  uploadProfileImage,
  logoutUser,
  changePassword,
  requestEmailChangeOtp,
  verifyEmailChangeOtp,
};
