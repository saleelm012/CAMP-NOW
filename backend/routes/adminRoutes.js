import express from "express";

import {
    adminLogin,
    adminLogout
} from "../controllers/adminAuthController.js";

import { loginLimiter } from "../middlewares/rateLimitMiddleware.js";

import protectAdmin from "../middlewares/adminMiddleware.js";

import {
    getUsers,
    updateUserStatus
} from "../controllers/adminUserController.js";

const router = express.Router();

router.post("/login", loginLimiter, adminLogin);

router.post("/logout", adminLogout);

router.get("/me", protectAdmin, (req, res) => {

    return res.status(200).json({
        message: "Authenticated admin",
        user: {
            id: req.admin._id,
            name: req.admin.name,
            email: req.admin.email,
            role: req.admin.role
        }
    });

});

router.get("/users", protectAdmin, getUsers);

router.patch("/users/:id/status", protectAdmin, updateUserStatus);

export default router;