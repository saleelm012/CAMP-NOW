import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, ArrowLeft } from 'lucide-react';
import api from '../../../axios/axios';

function EditProfile() {

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {

        const fetchProfile = async () => {
            try {

                const response = await api.get('/auth/me');

                setName(response.data.user.name || '');
                setPhone(response.data.user.phone || '');

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Failed to fetch profile'
                );
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (!name.trim() || !phone.trim()) {
            setError('All fields are required');
            return;
        }

        if (!/^[6-9]\d{9}$/.test(phone.trim())) {
            setError('Enter a valid phone number');
            return;
        }

        try {

            setSaving(true);

            await api.patch('/auth/profile', {
                name: name.trim(),
                phone: phone.trim()
            });

            navigate('/profile', { replace: true });

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to update profile'
            );
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-2xl mx-auto space-y-6">
                    <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
                    <div className="h-8 w-44 bg-neutral-200 rounded animate-pulse" />
                    <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-pulse">
                        <div className="h-12 bg-neutral-100 rounded-lg" />
                        <div className="h-12 bg-neutral-100 rounded-lg" />
                        <div className="flex gap-4 pt-2">
                            <div className="flex-1 h-12 bg-neutral-100 rounded-lg" />
                            <div className="flex-1 h-12 bg-neutral-100 rounded-lg" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">

            <div className="max-w-2xl mx-auto">

                {/* Back to Profile Link */}
                <div className="mb-4">
                    <Link
                        to="/profile"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Profile</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1">
                        Edit <span className="text-[#8B1D2C]">Profile</span>
                    </h1>
                    <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
                        Update your personal information and contact details.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-6 sm:p-8">

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Full Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm sm:text-base font-bold text-neutral-900 mb-2"
                            >
                                Full Name
                            </label>

                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                                    <User size={19} strokeWidth={1.8} />
                                </div>

                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full h-11 sm:h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div>
                            <label
                                htmlFor="phone"
                                className="block text-sm sm:text-base font-bold text-neutral-900 mb-2"
                            >
                                Phone Number
                            </label>

                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                                    <Phone size={19} strokeWidth={1.8} />
                                </div>

                                <input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Enter 10-digit mobile number"
                                    required
                                    className="w-full h-11 sm:h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                />
                            </div>

                            <p className="text-xs text-neutral-400 mt-1.5">
                                Must be a 10-digit number starting with 6, 7, 8, or 9.
                            </p>
                        </div>

                        {/* Error Alert */}
                        {error && (
                            <p
                                role="alert"
                                className="text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm font-medium"
                            >
                                {error}
                            </p>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">

                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                disabled={saving}
                                className="w-full sm:flex-1 h-12 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 shadow-xs flex items-center justify-center"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:flex-1 h-12 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default EditProfile;
