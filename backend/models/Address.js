import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    fullName: {
        type: String,
        required: true,
        trim: true
    },

    phone: {
        type: String,
        required: true,
        trim: true
    },

    addressLine1: {
        type: String,
        required: true,
        trim: true
    },

    addressLine2: {
        type: String,
        trim: true,
        default: ''
    },

    landmark: {
        type: String,
        trim: true,
        default: ''
    },

    city: {
        type: String,
        required: true,
        trim: true
    },

    state: {
        type: String,
        required: true,
        trim: true
    },

    pincode: {
        type: String,
        required: true,
        trim: true
    },

    country: {
        type: String,
        default: 'India'
    },

    addressType: {
        type: String,
        enum: ['Home', 'Work', 'Other'],
        default: 'Home'
    },

    isDefault: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

addressSchema.index({ userId: 1 });

addressSchema.index(
    { userId: 1, isDefault: 1 },
    {
        unique: true,
        partialFilterExpression: { isDefault: true }
    }
);

const Address = mongoose.model('Address', addressSchema);

export default Address;