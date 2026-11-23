import 'dotenv/config';
import sendOtpEmail from './services/emailService.js';
import generateOtp from './utils/generateOtp.js';

const testEmail = async () => {
    try {
        const otp = generateOtp();

        await sendOtpEmail(
            process.env.SMTP_USER,
            otp
        );

        console.log('Test OTP email sent successfully!');
    } catch (error) {
        console.error('Email sending failed:', error.message);
    }
};

testEmail();