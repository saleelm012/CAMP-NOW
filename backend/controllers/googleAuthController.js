import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const googleLogin = async (req, res) => {
  try {
    const { credential, phone } = req.body;

    if (typeof credential !== "string" || !credential.trim()) {
      return res.status(400).json({
        message: "Google credential is required",
      });
    }

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication configuration error",
      });
    }

    // Verify Google ID token
    let payload;

    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      payload = ticket.getPayload();
    } catch (error) {
      return res.status(401).json({
        message: "Invalid or expired Google credential",
      });
    }

    if (!payload?.sub || !payload.email || payload.email_verified !== true) {
      return res.status(401).json({
        message: "Google account verification failed",
      });
    }

    const googleId = payload.sub;
    const email = payload.email.trim().toLowerCase();
    const name = payload.name?.trim() || email.split("@")[0];

    // Require an email for which Google is authoritative
    if (!email.endsWith("@gmail.com") && !payload.hd) {
      return res.status(403).json({
        message: "Please use a Gmail or Google Workspace account",
      });
    }

    // Find existing Google user
    let user = await User.findOne({ googleId });

    if (user) {
      if (!user.isActive || user.role !== "user") {
        return res.status(403).json({
          message: "Account access denied",
        });
      }

      if (user.email !== email) {
        return res.status(409).json({
          message: "Google account email has changed. Contact support.",
        });
      }
    } else {
      // Check whether email is already registered
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          message:
            "Email already registered. Please use your existing login method.",
        });
      }

      // New Google user requires phone number
      if (phone === undefined) {
        return res.status(200).json({
          message: "Please provide your phone number",
          requiresPhone: true,
        });
      }

      if (typeof phone !== "string" || !/^[6-9]\d{9}$/.test(phone.trim())) {
        return res.status(400).json({
          message: "Enter a valid phone number",
        });
      }

      const normalizedPhone = phone.trim();

      const existingPhone = await User.findOne({
        phone: normalizedPhone,
      });

      if (existingPhone) {
        return res.status(409).json({
          message: "Phone number already registered",
        });
      }

      // Create new Google user
      user = await User.create({
        name,
        email,
        phone: normalizedPhone,
        googleId,
        authProvider: "google",
        isEmailVerified: true,
        role: "user",
      });
    }

    // Generate JWT
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

    // Set authentication cookie
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      message: "Google login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Google login error:", error.code || error.name);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "Account details already registered. Please try again.",
      });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export { googleLogin };
