import bcrypt from 'bcrypt';

const hashOtp = async (otp) => {
    const hashedOtp = await bcrypt.hash(otp, 10);

    return hashedOtp;
};

export default hashOtp;