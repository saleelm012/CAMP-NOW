import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find admin account
    const admin = await User.findOne({
      email: normalizedEmail,
      role: "admin",
      authProvider: "local",
    }).select("+password");

    if (!admin || !admin.password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check account status
    if (!admin.isActive) {
      return res.status(403).json({
        message: "Admin account is inactive",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: admin._id,
        tokenVersion: admin.tokenVersion ?? 0,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        audience: "camp-nou-admin",
      },
    );

    // Store JWT in cookie
    res.cookie("adminAccessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Admin login successful",
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

const adminLogout = (req, res) => {
  res.clearCookie("adminAccessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return res.status(200).json({
    message: "Admin logout successful",
  });
};

export { adminLogin, adminLogout };
