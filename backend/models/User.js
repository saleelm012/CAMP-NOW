import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true, 
        minlength: 8
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user"
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    profileImage: {
    type: String,
    default: null
},
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
    type: Boolean,
    default: false
    
},resetOtpHash: {
    type: String,
    select: false
},
resetOtpExpires: {
    type: Date
},
resetOtpAttempts: {
    type: Number,
    default: 0
},
resetTokenHash: {
    type: String,
    select: false
},
resetTokenExpires: {
    type: Date
}, 
tokenVersion: {
    type: Number,
    default: 0
},
pendingEmail: {
    type: String,
    lowercase: true,
    trim: true
},
emailChangeOtpHash: {
    type: String,
    select: false
},
emailChangeOtpExpires: {
    type: Date
},
emailChangeOtpAttempts: {
    type: Number,
    default: 0
},
emailChangeOtpLastSentAt: {
    type: Date
},
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
