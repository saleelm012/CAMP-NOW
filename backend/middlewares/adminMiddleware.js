import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectAdmin = async (req, res, next) => {
    try {
        // Get admin token from cookie
        const token = req.cookies?.adminAccessToken;

        if (!token) {
            return res.status(401).json({
                message: "Admin authentication required"
            });
        }

        // Verify JWT token
        const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
    {
        audience: "camp-nou-admin",
        algorithms: ["HS256"]
    }
);

        // Find admin account
        const admin = await User.findById(decoded.id)
            .select("-password");

        if (!admin) {
            return res.status(401).json({
                message: "Account not found"
            });
        }

        // Check admin role
        if (admin.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            });
        }

        // Check account status
        if (!admin.isActive) {
            return res.status(403).json({
                message: "Admin account is inactive"
            });
        }

        // Verify session version
        if (decoded.tokenVersion !== (admin.tokenVersion ?? 0)) {
            return res.status(401).json({
                message: "Session expired. Please login again."
            });
        }

        req.admin = admin;

        next();

    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired admin token"
        });
    }
};

export default protectAdmin;