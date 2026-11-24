import express from 'express';
import { registerUser, loginUser, verifyRegistrationOtp, resendRegistrationOtp } from '../controllers/authcontroller.js';
import protect from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyRegistrationOtp);
router.post('/resend-otp', resendRegistrationOtp)
router.post('/login', loginUser);

router.get('/me', protect, (req, res) => {
    res.status(200).json({
        message: 'Authenticated user',
        user: req.user
    });
});

export default router;
