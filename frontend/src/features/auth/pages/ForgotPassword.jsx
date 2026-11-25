import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import api from '../../../axios/axios';

function ForgotPassword() {

    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (!email.trim()) {
            setError('Email is required');
            return;
        }

        try {
            setLoading(true);

            const normalizedEmail = email.trim().toLowerCase();

            await api.post('/auth/forgot-password', {
                email: normalizedEmail
            });

            navigate('/verify-reset-otp', {
                state: { email: normalizedEmail }
            });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Something went wrong'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            <div className="w-full max-w-lg mx-auto">

                <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
                    Forgot <span className="text-[#8B1D2C]">
                        Password?
                    </span>
                </h1>

                <p className="text-neutral-500 text-sm sm:text-base mb-8">
                    Enter your registered email address to receive
                    a password reset OTP.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <label className="text-sm font-bold">
                        Email Address
                    </label>

                    <div className="relative mt-2">

                        <Mail
                            size={19}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
                        />

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-lg text-sm outline-none focus:border-neutral-900"
                            required
                        />

                    </div>

                    {error && (
                        <p role="alert" className="text-red-600 text-sm">
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-12 bg-[#141414] text-white rounded-lg font-bold cursor-pointer hover:bg-neutral-800 disabled:opacity-60"
                    >
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>

                </form>

                <p className="text-center text-sm mt-6">
                    <Link
                        to="/login"
                        className="text-[#8B1D2C] font-bold hover:underline"
                    >
                        Back to Login
                    </Link>
                </p>

            </div>
        </AuthLayout>
    );
}

export default ForgotPassword;