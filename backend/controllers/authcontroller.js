import User from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import PendingRegistration from '../models/PendingRegistration.js';
import generateOtp from '../utils/generateOtp.js';
import hashOtp from '../utils/hashOtp.js';
import sendOtpEmail from '../services/emailService.js';
import mongoose from 'mongoose';

const registerUser = async (req, res) => {
    try {

        // console.log('third route');

        const { name, email, password, phone } = req.body;

        // Check required fields
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                message: 'All fields are required'
            });
        }

        // Normalize email
        const normalizedEmail = email.trim().toLowerCase();

        // Check existing user
        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { phone: phone.trim() }
            ]
        });

        if (existingUser) {
            return res.status(409).json({
                message: 'Email or phone already exists'
            });
        }

        // Find existing pending registration
const pendingUser = await PendingRegistration.findOne({
    email: normalizedEmail
});



        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
const otp = generateOtp();

// Hash OTP
const hashedOtp = await hashOtp(otp);

// OTP expires after 5 minutes
const otpExpiresAt = new Date(
    Date.now() + 5 * 60 * 1000
);

// Save pending registration
// Save or update pending registration
const now = new Date();

const cooldownTime = new Date(
    now.getTime() - 60 * 1000
);

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
        otpLastSentAt: now
    });

} else {

    // Existing pending registration
   const result = await PendingRegistration.updateOne(
    {
        _id: pendingUser._id,
        verificationStatus: 'pending',
        $or: [
            { otpLastSentAt: null },
            { otpLastSentAt: { $lte: cooldownTime } }
        ]
    },
    {
        $set: {
            name,
            phone: phone.trim(),
            passwordHash: hashedPassword,
            otpHash: hashedOtp,
            otpExpiresAt,
            otpAttempts: 0,
            otpLastSentAt: now
        }
    }
);

    if (result.modifiedCount === 0) {
        return res.status(429).json({
            message: 'Please wait before requesting another OTP'
        });
    }
}

// Send OTP to user's email
await sendOtpEmail(normalizedEmail, otp);

// Send response to frontend
return res.status(200).json({
    message: 'OTP sent successfully. Please verify your email.',
    email: normalizedEmail
}); 

   
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Email or phone already exists'
            });
        }

        console.error(error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const verifyRegistrationOtp = async (req, res) => {

     let session;

    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const pendingUser = await PendingRegistration.findOne({
            email: normalizedEmail
        });

        if (!pendingUser) {
            return res.status(400).json({
                message: 'No pending registration found'
            });
        }
        // Check OTP expiry
if (pendingUser.otpExpiresAt.getTime() <= Date.now()) {
    return res.status(400).json({
        message: 'OTP has expired. Please request a new OTP.'
    });
}

// Check maximum OTP attempts
if (pendingUser.otpAttempts >= 5) {
    return res.status(429).json({
        message: 'Too many incorrect attempts. Please request a new OTP.'
    });
}

// Compare entered OTP with stored hashed OTP
const isOtpValid = await bcrypt.compare(
    String(otp),
    pendingUser.otpHash
);

// If OTP is incorrect
if (!isOtpValid) {

    const result = await PendingRegistration.updateOne(
        {
            _id: pendingUser._id,
            otpAttempts: { $lt: 5 },
            otpHash: pendingUser.otpHash,
            otpExpiresAt: { $gt: new Date() }
        },
        {
            $inc: { otpAttempts: 1 }
        }
    );

    if (result.modifiedCount === 0) {
        return res.status(429).json({
            message: 'OTP expired, changed, or attempt limit reached'
        });
    }

    return res.status(400).json({
        message: 'Invalid OTP'
    });
}

 session = await mongoose.startSession();

let user = null;

 await session.withTransaction(async () => {
// Atomically claim OTP verification
const claimedUser = await PendingRegistration.findOneAndUpdate(
    {
        _id: pendingUser._id,
        verificationStatus: 'pending',
        otpHash: pendingUser.otpHash,
        otpAttempts: { $lt: 5 },
        otpExpiresAt: { $gt: new Date() }
    },
    {
        $set: {
            verificationStatus: 'processing'
        }
    },
   {
    new: true,
    session
}
);

if (!claimedUser) {
    const error = new Error(
        'OTP verification cannot be completed. Please try again.'
    );

    error.statusCode = 409;

    throw error;
}

// Create verified user
const [createdUser] = await User.create(
    [{
        name: pendingUser.name,
        email: pendingUser.email,
        phone: pendingUser.phone,
        password: pendingUser.passwordHash,
        isEmailVerified: true
    }],
    { session }
);

user = createdUser;

// Delete temporary registration
const deleteResult = await PendingRegistration.deleteOne(
    { _id: pendingUser._id },
    { session }
);

if (deleteResult.deletedCount !== 1) {
    throw new Error('Pending registration deletion failed');
}

});

// Send success response
return res.status(201).json({
    message: 'Email verified. Registration successful!',
    user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
    }
});

    } catch (error) {
        console.error(error);

        return res.status(error.statusCode || 500).json({
            message: error.statusCode
                ? error.message
                : 'Internal server error'
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

        if (!email || typeof email !== 'string') {
            return res.status(400).json({
                message: 'Valid email is required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const pendingUser = await PendingRegistration.findOne({
            email: normalizedEmail
        });

        if (!pendingUser) {
            return res.status(400).json({
                message: 'No pending registration found'
            });
        };


// Generate a new OTP
const otp = generateOtp();

// Hash the new OTP
const hashedOtp = await hashOtp(otp);

// Set new OTP expiry time
const otpExpiresAt = new Date(
    Date.now() + 5 * 60 * 1000
);

// Atomic cooldown check and OTP update
const now = new Date();

const cooldownTime = new Date(
    now.getTime() - 60 * 1000
);

const result = await PendingRegistration.updateOne(
    {
    _id: pendingUser._id,
    verificationStatus: 'pending',
    $or: [
        { otpLastSentAt: null },
        { otpLastSentAt: { $lte: cooldownTime } }
    ]
},

    {
        $set: {
            otpHash: hashedOtp,
            otpExpiresAt,
            otpAttempts: 0,
            otpLastSentAt: now
        }
    }
);

if (result.modifiedCount === 0) {
    return res.status(429).json({
        message: 'Please wait before resending OTP'
    });
}

// Send new OTP to user's email
await sendOtpEmail(normalizedEmail, otp);

// Send success response
return res.status(200).json({
    message: 'New OTP sent successfully'
});


    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'email and password are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: 'invalid email or password'
            });
        }

        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('accessToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/'
});

        return res.status(200).json({
            message: 'login successfull',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });

    } catch (error) {
        console.log(error);

        return res.status(500).json({
            message: "internel server error"
        });
    }
};

export {
    registerUser,
    loginUser,
    verifyRegistrationOtp,
    resendRegistrationOtp
};