import express from 'express';
import { 
    registerUser,
     loginUser, 
     verifyRegistrationOtp, 
     resendRegistrationOtp,
      forgotPassword,
      verifyResetOtp,
      resetPassword,
      updateProfile,
      uploadProfileImage,
      logoutUser,
      changePassword,
      requestEmailChangeOtp,
      verifyEmailChangeOtp,
    }
    from '../controllers/authcontroller.js';


import protect from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/verify-otp', verifyRegistrationOtp);
router.post('/resend-otp', resendRegistrationOtp)
router.post('/login', loginUser);
router.post('/logout', logoutUser);

router.get('/me', protect, (req, res) => {
    res.status(200).json({
        message: 'Authenticated user',
        user: req.user
    });
});

router.post('/forgot-password', forgotPassword);
router.post('/verify-reset-otp', verifyResetOtp);
router.post('/reset-password', resetPassword);
router.patch('/profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);

router.patch(
    '/profile/image',
    protect,
    upload.single('profileImage'),
    uploadProfileImage
);

router.post(
    '/change-email/request-otp',
    protect,
    requestEmailChangeOtp
);

router.post(
    '/change-email/verify-otp',
    protect,
    verifyEmailChangeOtp
);

export default router;
