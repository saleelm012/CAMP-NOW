import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../models/User.js";

const createAdmin = async () => {
    try {
        const {
            ADMIN_NAME,
            ADMIN_EMAIL,
            ADMIN_PASSWORD,
            ADMIN_PHONE
        } = process.env;

        // Validate required fields
        if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_PHONE) {
            throw new Error("Admin credentials are missing");
        }

        if (
            ADMIN_PASSWORD.length < 12 ||
            Buffer.byteLength(ADMIN_PASSWORD, "utf8") > 72
        ) {
            throw new Error("Invalid admin password length");
        }

        const email = ADMIN_EMAIL.trim().toLowerCase();
        const phone = ADMIN_PHONE.trim();

        // Connect MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        // Check existing account
        const existingUser = await User.findOne({
            $or: [
                { email },
                { phone }
            ]
        });

        if (existingUser) {
            console.log("Email or phone already registered");
            return;
        }

        // Hash admin password
        const hashedPassword = await bcrypt.hash(
            ADMIN_PASSWORD,
            12
        );

        // Create admin account
        await User.create({
            name: ADMIN_NAME.trim(),
            email,
            phone,
            password: hashedPassword,
            role: "admin",
            authProvider: "local",
            isActive: true,
            isEmailVerified: true
        });

        console.log("Admin account created successfully");

    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exitCode = 1;

    } finally {
        await mongoose.disconnect();
    }
};

createAdmin();