import mongoose from 'mongoose';
import Address from '../models/Address.js';

const addAddress = async (req, res) => {

    try {

        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            pincode,
            addressType
        } = req.body;

        // Required fields validation
        const requiredFields = [
            fullName,
            phone,
            addressLine1,
            city,
            state,
            pincode
        ];

        if (requiredFields.some(
            field => typeof field !== 'string' || !field.trim()
        )) {
            return res.status(400).json({
                message: 'All required fields must be filled'
            });
        }

        // Phone validation
        if (!/^[6-9]\d{9}$/.test(phone.trim())) {
            return res.status(400).json({
                message: 'Invalid phone number'
            });
        }

        // Pincode validation
        if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
            return res.status(400).json({
                message: 'Invalid pincode'
            });
        }

        // Optional fields validation
        if (
            (addressLine2 !== undefined &&
                typeof addressLine2 !== 'string') ||
            (landmark !== undefined &&
                typeof landmark !== 'string')
        ) {
            return res.status(400).json({
                message: 'Invalid address details'
            });
        }

        // Address type validation
        if (
            addressType !== undefined &&
            !['Home', 'Work', 'Other'].includes(addressType)
        ) {
            return res.status(400).json({
                message: 'Invalid address type'
            });
        }

        // Check existing addresses
        const existingAddress = await Address.exists({
            userId: req.user._id
        });

        // Create new address
        const address = await Address.create({
            userId: req.user._id,
            fullName,
            phone,
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            pincode,
            addressType,
            isDefault: !existingAddress
        });

        return res.status(201).json({
            message: 'Address added successfully',
            address
        });

        

    } catch (error) {

        console.error(error);

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Address conflict. Please try again.'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const getAddresses = async (req, res) => {

    try {

        const addresses = await Address.find({
            userId: req.user._id
        }).sort({
            isDefault: -1,
            createdAt: -1
        });

        return res.status(200).json({
            message: 'Addresses fetched successfully',
            addresses
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const updateAddress = async (req, res) => {

    try {

        const { addressId } = req.params;

        if (!/^[a-fA-F0-9]{24}$/.test(addressId)) {
            return res.status(400).json({
                message: 'Invalid address ID'
            });
        }

        const {
            fullName,
            phone,
            addressLine1,
            addressLine2,
            landmark,
            city,
            state,
            pincode,
            addressType
        } = req.body;

        const requiredFields = [
            fullName,
            phone,
            addressLine1,
            city,
            state,
            pincode
        ];

        if (requiredFields.some(
            field => typeof field !== 'string' || !field.trim()
        )) {
            return res.status(400).json({
                message: 'All required fields must be filled'
            });
        }

        if (!/^[6-9]\d{9}$/.test(phone.trim())) {
            return res.status(400).json({
                message: 'Invalid phone number'
            });
        }

        if (!/^[1-9]\d{5}$/.test(pincode.trim())) {
            return res.status(400).json({
                message: 'Invalid pincode'
            });
        }

        if (
            (addressLine2 !== undefined &&
                typeof addressLine2 !== 'string') ||
            (landmark !== undefined &&
                typeof landmark !== 'string')
        ) {
            return res.status(400).json({
                message: 'Invalid address details'
            });
        }

        if (!['Home', 'Work', 'Other'].includes(addressType)) {
            return res.status(400).json({
                message: 'Invalid address type'
            });
        }

        const address = await Address.findOneAndUpdate(
            {
                _id: addressId,
                userId: req.user._id
            },
            {
                $set: {
                    fullName,
                    phone,
                    addressLine1,
                    addressLine2: addressLine2 ?? '',
                    landmark: landmark ?? '',
                    city,
                    state,
                    pincode,
                    addressType
                }
            },
            {
               returnDocument: 'after',
                runValidators: true
            }
        );

        if (!address) {
            return res.status(404).json({
                message: 'Address not found'
            });
        }

        return res.status(200).json({
            message: 'Address updated successfully',
            address
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            message: 'Internal server error'
        });
    }
};

const deleteAddress = async (req, res) => {

    const { addressId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(addressId)) {
        return res.status(400).json({
            message: 'Invalid address ID'
        });
    }

    let session;

    try {

        session = await mongoose.startSession();

        await session.withTransaction(async () => {

            const address = await Address.findOneAndDelete(
                {
                    _id: addressId,
                    userId: req.user._id
                },
                { session }
            );

            if (!address) {
                throw new Error('ADDRESS_NOT_FOUND');
            }

            if (address.isDefault) {

                const existingDefault = await Address.exists({
                    userId: req.user._id,
                    isDefault: true
                }).session(session);

                if (!existingDefault) {

                    await Address.findOneAndUpdate(
                        {
                            userId: req.user._id
                        },
                        {
                            $set: { isDefault: true }
                        },
                        {
                            sort: { createdAt: -1 },
                            runValidators: true,
                            session
                        }
                    );
                }
            }

        });

        return res.status(200).json({
            message: 'Address deleted successfully'
        });

    } catch (error) {

        console.error(error);

        if (error.message === 'ADDRESS_NOT_FOUND') {
            return res.status(404).json({
                message: 'Address not found'
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Address conflict. Please try again.'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });

    } finally {

        if (session) {
            await session.endSession();
        }
    }
};

const setDefaultAddress = async (req, res) => {

    const { addressId } = req.params;

    if (!/^[a-fA-F0-9]{24}$/.test(addressId)) {
        return res.status(400).json({
            message: 'Invalid address ID'
        });
    }

    let session;

    try {

        session = await mongoose.startSession();

        let updatedAddress;

        await session.withTransaction(async () => {

            const address = await Address.findOne({
                _id: addressId,
                userId: req.user._id
            }).session(session);

            if (!address) {
                throw new Error('ADDRESS_NOT_FOUND');
            }

            if (address.isDefault) {
                updatedAddress = address;
                return;
            }

            await Address.updateMany(
                {
                    userId: req.user._id,
                    isDefault: true
                },
                {
                    $set: { isDefault: false }
                },
                { session }
            );

            updatedAddress = await Address.findOneAndUpdate(
                {
                    _id: addressId,
                    userId: req.user._id
                },
                {
                    $set: { isDefault: true }
                },
                {
                    returnDocument: 'after',
                    runValidators: true,
                    session
                }
            );

            if (!updatedAddress) {
                throw new Error('ADDRESS_NOT_FOUND');
            }

        });

        return res.status(200).json({
            message: 'Default address updated successfully',
            address: updatedAddress
        });

    } catch (error) {

        console.error(error);

        if (error.message === 'ADDRESS_NOT_FOUND') {
            return res.status(404).json({
                message: 'Address not found'
            });
        }

        if (error.code === 11000) {
            return res.status(409).json({
                message: 'Address conflict. Please try again.'
            });
        }

        return res.status(500).json({
            message: 'Internal server error'
        });

    } finally {

        if (session) {
            await session.endSession();
        }
    }
};
export {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};