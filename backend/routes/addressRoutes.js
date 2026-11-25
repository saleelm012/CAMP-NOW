import express from 'express';

import {
    addAddress,
    getAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} from '../controllers/addressController.js';

import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, addAddress);

router.get('/', protect, getAddresses);

router.put('/:addressId', protect, updateAddress);

router.delete('/:addressId', protect, deleteAddress);

router.patch('/:addressId/default', protect, setDefaultAddress);

export default router;