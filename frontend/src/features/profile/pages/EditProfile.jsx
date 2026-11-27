import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, ArrowLeft } from 'lucide-react';
import api from '../../../axios/axios';

function EditProfile() {

    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [profileLoaded, setProfileLoaded] = useState(false);

    useEffect(() => {

        let cancelled = false;

        const fetchProfile = async () => {
            try {

                const response = await api.get('/auth/me');

                if (cancelled) return;

                setName(response.data.user.name || '');
                setPhone(response.data.user.phone || '');
                setProfileLoaded(true);

            } catch (err) {

                if (cancelled) return;

                setError(
                    err.response?.data?.message ||
                    'Failed to fetch profile'
                );

            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            cancelled = true;
        };

    }, []);

    const validateForm = () => {

        const errors = {};

        const trimmedName = name.trim();
        const trimmedPhone = phone.trim();

        // Full Name validation
        if (!trimmedName) {
            errors.name = 'Full name is required';
        } else if (trimmedName.length < 2) {
            errors.name = 'Name must contain at least 2 characters';
        } else if (trimmedName.length > 100) {
            errors.name = 'Name must not exceed 100 characters';
        }

        // Phone Number validation
        if (!trimmedPhone) {
            errors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(trimmedPhone)) {
            errors.phone = 'Enter a valid 10-digit phone number';
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving || loading || !profileLoaded) return;

        setError('');

        if (!validateForm()) return;

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

    // Loading Skeleton
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

    // Profile Fetch Error
    if (!profileLoaded) {
        return (
            <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center p-6">

                <div className="max-w-md w-full bg-white border border-neutral-200/90 rounded-2xl p-8 text-center shadow-xs">

                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <User size={24} />
                    </div>

                    <h2 className="text-xl font-bold text-neutral-900 mb-2">
                        Unable to Load Profile
                    </h2>

                    <p
                        role="alert"
                        className="text-neutral-500 text-sm mb-6"
                    >
                        {error || 'Failed to fetch profile'}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="inline-flex items-center justify-center w-full h-11 bg-[#141414] text-white rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                    >
                        Back to Profile
                    </button>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">

            <div className="max-w-2xl mx-auto">

                {/* Back to Profile Button */}
                <div className="mb-4">

                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        disabled={saving}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Profile</span>
                    </button>

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

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                        noValidate
                    >

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
                                    name="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => {

                                        setName(e.target.value);

                                        setFieldErrors(prev => ({
                                            ...prev,
                                            name: ''
                                        }));

                                        setError('');
                                    }}
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    maxLength={100}
                                    required
                                    disabled={saving}
                                    aria-invalid={!!fieldErrors.name}
                                    aria-describedby={
                                        fieldErrors.name
                                            ? 'name-error'
                                            : undefined
                                    }
                                    className={`w-full h-11 sm:h-12 pl-12 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs disabled:opacity-60 ${
                                        fieldErrors.name
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                    }`}
                                />

                            </div>

                            {fieldErrors.name && (
                                <p
                                    id="name-error"
                                    className="text-red-600 text-xs mt-1.5"
                                >
                                    {fieldErrors.name}
                                </p>
                            )}

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
                                    name="phone"
                                    type="tel"
                                    inputMode="numeric"
                                    value={phone}
                                    onChange={(e) => {

                                        setPhone(e.target.value);

                                        setFieldErrors(prev => ({
                                            ...prev,
                                            phone: ''
                                        }));

                                        setError('');
                                    }}
                                    placeholder="Enter 10-digit mobile number"
                                    autoComplete="tel-national"
                                    maxLength={10}
                                    required
                                    disabled={saving}
                                    aria-invalid={!!fieldErrors.phone}
                                    aria-describedby={
                                        fieldErrors.phone
                                            ? 'phone-error'
                                            : 'phone-help'
                                    }
                                    className={`w-full h-11 sm:h-12 pl-12 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs disabled:opacity-60 ${
                                        fieldErrors.phone
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                    }`}
                                />

                            </div>

                            {fieldErrors.phone ? (

                                <p
                                    id="phone-error"
                                    className="text-red-600 text-xs mt-1.5"
                                >
                                    {fieldErrors.phone}
                                </p>

                            ) : (

                                <p
                                    id="phone-help"
                                    className="text-xs text-neutral-400 mt-1.5"
                                >
                                    Must be a 10-digit number starting with 6, 7, 8, or 9.
                                </p>

                            )}

                        </div>

                        {/* Backend Error Alert */}
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
                                className="w-full sm:flex-1 h-12 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm sm:text-base font-semibold transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:flex-1 h-12 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
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