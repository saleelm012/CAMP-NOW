import api from '../axios/axios';

// Register User
export const registerUser = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'Registration failed';
        throw new Error(message, { cause: error });
    }
};

// Verify Registration OTP
export const verifyRegistrationOtp = async (email, otp) => {
    try {
        const response = await api.post('/auth/verify-otp', {
            email,
            otp
        });

        return response.data;

    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            'OTP verification failed';

        throw new Error(message, { cause: error });
    }
};

// Resend Registration OTP
export const resendRegistrationOtp = async (email) => {
    try {
        const response = await api.post('/auth/resend-otp', {
            email
        });

        return response.data;

    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            'Failed to resend OTP';

        throw new Error(message, { cause: error });
    }
};

export const loginUser = async (email, password) => {
    try {
        const response = await api.post('/auth/login', {
            email,
            password
        });

        return response.data;

    } catch (error) {
    console.error('Login API Error:', error);

    throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Login failed'
    );
  }
};  