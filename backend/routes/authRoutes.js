import express from 'express';
import { registerUser, loginUser, verifyRegistrationOtp, resendRegistrationOtp } from '../controllers/authcontroller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyRegistrationOtp);
router.post('/resend-otp', resendRegistrationOtp)
router.post('/login', loginUser);

export default router;
