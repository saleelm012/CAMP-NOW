import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.accessToken;

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Please login.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      audience: "camp-nou-customer",
      algorithms: ["HS256"],
    });

    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isActive === false) {
      return res.status(401).json({
        message: "User not found or account blocked",
      });
    }

    if (user.role !== "user") {
      return res.status(403).json({
        message: "Customer access required",
      });
    }

    // Check token version
    if (decoded.tokenVersion !== (user.tokenVersion ?? 0)) {
      return res.status(401).json({
        message: "Session expired. Please login again.",
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default protect;
