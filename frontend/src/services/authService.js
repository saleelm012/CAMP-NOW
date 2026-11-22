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
