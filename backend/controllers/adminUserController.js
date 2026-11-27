import User from "../models/User.js";
import mongoose from "mongoose";

const getUsers = async (req, res) => {

    try {

        const { search = "", page = "1", limit = "10" } = req.query;

        const currentPage = Number(page);
        const pageSize = Number(limit);

        // Validate query parameters
        if (
            typeof search !== "string" ||
            !Number.isSafeInteger(currentPage) ||
            currentPage < 1 ||
            !Number.isSafeInteger(pageSize) ||
            pageSize < 1 ||
            pageSize > 100 ||
            search.length > 100
        ) {
            return res.status(400).json({
                message: "Invalid query parameters"
            });
        }

        const skip = (currentPage - 1) * pageSize;

        // Fetch customers only
        const filter = {
            role: "user"
        };

        // Search functionality
        if (search.trim()) {

            const searchValue = search.trim().replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&"
            );

            filter.$or = [
                { name: { $regex: searchValue, $options: "i" } },
                { email: { $regex: searchValue, $options: "i" } },
                { phone: { $regex: searchValue, $options: "i" } }
            ];
        }

        // Fetch users and total count
        const [users, totalUsers] = await Promise.all([

            User.find(filter)
                .select("name email phone profileImage isActive createdAt")
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(pageSize),

            User.countDocuments(filter)

        ]);

        return res.status(200).json({
            message: "Users fetched successfully",
            users,
            pagination: {
                currentPage,
                pageSize,
                totalUsers,
                totalPages: Math.ceil(totalUsers / pageSize)
            }
        });

    } catch (error) {

        console.error("Get users error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

const updateUserStatus = async (req, res) => {

    try {

        const { id } = req.params;
        const { isActive } = req.body || {};

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid user ID"
            });
        }

        if (typeof isActive !== "boolean") {
            return res.status(400).json({
                message: "isActive must be a boolean"
            });
        }

        const update = {
            $set: { isActive }
        };

        if (isActive === false) {
            update.$inc = {
                tokenVersion: 1
            };
        }

        const user = await User.findOneAndUpdate(
            {
                _id: id,
                role: "user",
                isActive: { $ne: isActive }
            },
            update,
            {
                returnDocument: "after"
            }
        ).select("name email phone isActive createdAt");

        if (!user) {
            const existingUser = await User.findOne({
                _id: id,
                role: "user"
            }).select("name email phone isActive createdAt");

            if (!existingUser) {
                return res.status(404).json({
                    message: "User not found"
                });
            }

            return res.status(200).json({
                message: "User status already set or changed",
                user: existingUser
            });
        }

        return res.status(200).json({
            message: isActive
                ? "User unblocked successfully"
                : "User blocked successfully",
            user
        });

    } catch (error) {

        console.error("Update user status error:", error.message);

        return res.status(500).json({
            message: "Internal server error"
        });
    }
};


export { getUsers, updateUserStatus };