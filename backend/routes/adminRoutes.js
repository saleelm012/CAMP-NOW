import express from "express";

import { adminLogin, adminLogout } from "../controllers/adminAuthController.js";

import { loginLimiter } from "../middlewares/rateLimitMiddleware.js";

import protectAdmin from "../middlewares/adminMiddleware.js";

const router = express.Router();

// Admin Login
router.post("/login", loginLimiter, adminLogin);

// Admin Logout
router.post("/logout", adminLogout);

// Authenticated Admin
router.get("/me", protectAdmin, (req, res) => {
  return res.status(200).json({
    message: "Authenticated admin",
    user: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
      role: req.admin.role,
    },
  });
});

export default router;
