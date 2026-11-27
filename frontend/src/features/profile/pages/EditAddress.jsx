import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Building } from 'lucide-react';
import api from '../../../axios/axios';

function EditAddress() {

    const navigate = useNavigate();
    const { addressId } = useParams();

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        landmark: '',
        city: '',
        state: '',
        pincode: '',
        addressType: 'Home'
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [addressFound, setAddressFound] = useState(false);

    useEffect(() => {

        let cancelled = false;

        setLoading(true);
        setAddressFound(false);
        setError('');
        setFieldErrors({});

        const fetchAddress = async () => {
            try {
                const response = await api.get('/addresses');

                if (cancelled) return;

                const address = response.data.addresses.find(
                    item => item._id === addressId
                );

                if (!address) {
                    setError('Address not found');
                    return;
                }

                setFormData({
                    fullName: address.fullName || '',
                    phone: address.phone || '',
                    addressLine1: address.addressLine1 || '',
                    addressLine2: address.addressLine2 || '',
                    landmark: address.landmark || '',
                    city: address.city || '',
                    state: address.state || '',
                    pincode: address.pincode || '',
                    addressType: address.addressType || 'Home'
                });

                setAddressFound(true);

            } catch (err) {

                if (cancelled) return;

                setError(
                    err.response?.data?.message ||
                    'Failed to fetch address'
                );

            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchAddress();

        return () => {
            cancelled = true;
        };

    }, [addressId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setFieldErrors(prev => ({
            ...prev,
            [name]: ''
        }));

        setError('');
    };

    const validateForm = () => {
        const errors = {};

        // Full Name validation
        if (!formData.fullName.trim()) {
            errors.fullName = 'Full name is required';
        }

        // Phone Number validation
        if (!formData.phone.trim()) {
            errors.phone = 'Phone number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
            errors.phone = 'Enter a valid 10-digit phone number';
        }

        // Address validation
        if (!formData.addressLine1.trim()) {
            errors.addressLine1 = 'Address is required';
        }

        // City validation
        if (!formData.city.trim()) {
            errors.city = 'City is required';
        }

        // State validation
        if (!formData.state.trim()) {
            errors.state = 'State is required';
        }

        // Pincode validation
        if (!formData.pincode.trim()) {
            errors.pincode = 'Pincode is required';
        } else if (!/^[1-9]\d{5}$/.test(formData.pincode.trim())) {
            errors.pincode = 'Enter a valid 6-digit pincode';
        }

        // Address Type validation
        if (!['Home', 'Work', 'Other'].includes(formData.addressType)) {
            errors.addressType = 'Select a valid address type';
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (saving || loading || !addressFound) return;

        setError('');

        if (!validateForm()) return;

        try {
            setSaving(true);

            await api.put(`/addresses/${addressId}`, {
                ...formData,
                fullName: formData.fullName.trim(),
                phone: formData.phone.trim(),
                addressLine1: formData.addressLine1.trim(),
                addressLine2: formData.addressLine2.trim(),
                landmark: formData.landmark.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                pincode: formData.pincode.trim()
            });

            navigate('/profile/addresses');

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to update address'
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-11 bg-neutral-100 rounded-lg" />
                            <div className="h-11 bg-neutral-100 rounded-lg" />
                        </div>

                        <div className="h-11 bg-neutral-100 rounded-lg" />

                        <div className="h-11 bg-neutral-100 rounded-lg" />

                        <div className="grid grid-cols-3 gap-4">
                            <div className="h-11 bg-neutral-100 rounded-lg" />
                            <div className="h-11 bg-neutral-100 rounded-lg" />
                            <div className="h-11 bg-neutral-100 rounded-lg" />
                        </div>

                    </div>

                </div>

            </div>
        );
    }

    // Address Not Found
    if (!addressFound) {
        return (
            <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center p-6">

                <div className="max-w-md w-full bg-white border border-neutral-200/90 rounded-2xl p-8 text-center shadow-xs">

                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <MapPin size={24} />
                    </div>

                    <h2 className="text-xl font-bold text-neutral-900 mb-2">
                        Address Error
                    </h2>

                    <p className="text-neutral-500 text-sm mb-6">
                        {error || 'Unable to locate the specified address.'}
                    </p>

                    <button
                        type="button"
                        onClick={() => navigate('/profile/addresses')}
                        className="inline-flex items-center justify-center w-full h-11 bg-[#141414] text-white rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
                    >
                        Back to Addresses
                    </button>

                </div>

            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">

            <div className="max-w-2xl mx-auto">

                {/* Back Button */}
                <div className="mb-4">

                    <button
                        type="button"
                        onClick={() => navigate('/profile/addresses')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Addresses</span>
                    </button>

                </div>

                {/* Header */}
                <div className="mb-6">

                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1">
                        Edit <span className="text-[#8B1D2C]">Address</span>
                    </h1>

                    <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
                        Update your delivery destination and contact information.
                    </p>

                </div>

                {/* Form Card */}
                <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-6 sm:p-8">

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                        noValidate
                    >

                        {/* Contact Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

                            {/* Full Name */}
                            <div>

                                <label
                                    htmlFor="fullName"
                                    className="block text-sm font-bold text-neutral-900 mb-2"
                                >
                                    Full Name
                                </label>

                                <div className="relative">

                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                                        <User size={18} strokeWidth={1.8} />
                                    </div>

                                    <input
                                        id="fullName"
                                        type="text"
                                        name="fullName"
                                        placeholder="Full Name"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        required
                                        aria-invalid={!!fieldErrors.fullName}
                                        aria-describedby={
                                            fieldErrors.fullName
                                                ? 'fullName-error'
                                                : undefined
                                        }
                                        className={`w-full h-11 sm:h-12 pl-11 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                                            fieldErrors.fullName
                                                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                        }`}
                                    />

                                </div>

                                {fieldErrors.fullName && (
                                    <p
                                        id="fullName-error"
                                        className="text-red-600 text-xs mt-1.5"
                                    >
                                        {fieldErrors.fullName}
                                    </p>
                                )}

                            </div>

                            {/* Phone Number */}
                            <div>

                                <label
                                    htmlFor="phone"
                                    className="block text-sm font-bold text-neutral-900 mb-2"
                                >
                                    Phone Number
                                </label>

                                <div className="relative">

                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                                        <Phone size={18} strokeWidth={1.8} />
                                    </div>

                                    <input
                                        id="phone"
                                        type="tel"
                                        name="phone"
                                        placeholder="10-digit mobile number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        autoComplete="tel-national"
                                        maxLength={10}
                                        required
                                        aria-invalid={!!fieldErrors.phone}
                                        aria-describedby={
                                            fieldErrors.phone
                                                ? 'phone-error'
                                                : undefined
                                        }
                                        className={`w-full h-11 sm:h-12 pl-11 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                                            fieldErrors.phone
                                                ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                                : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                        }`}
                                    />

                                </div>

                                {fieldErrors.phone && (
                                    <p
                                        id="phone-error"
                                        className="text-red-600 text-xs mt-1.5"
                                    >
                                        {fieldErrors.phone}
                                    </p>
                                )}

                            </div>

                        </div>

                        {/* Address Line 1 */}
                        <div>

                            <label
                                htmlFor="addressLine1"
                                className="block text-sm font-bold text-neutral-900 mb-2"
                            >
                                House / Flat / Building Name
                            </label>

                            <div className="relative">

                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                                    <Building size={18} strokeWidth={1.8} />
                                </div>

                                <input
                                    id="addressLine1"
                                    type="text"
                                    name="addressLine1"
                                    placeholder="Flat, House no., Building, Company, Apartment"
                                    value={formData.addressLine1}
                                    onChange={handleChange}
                                    autoComplete="address-line1"
                                    required
                                    aria-invalid={!!fieldErrors.addressLine1}
                                    aria-describedby={
                                        fieldErrors.addressLine1
                                            ? 'addressLine1-error'
                                            : undefined
                                    }
                                    className={`w-full h-11 sm:h-12 pl-11 pr-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                                        fieldErrors.addressLine1
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                    }`}
                                />

                            </div>

                            {fieldErrors.addressLine1 && (
                                <p
                                    id="addressLine1-error"
                                    className="text-red-600 text-xs mt-1.5"
                                >
                                    {fieldErrors.addressLine1}
                                </p>
                            )}

                        </div>

                        {/* Address Line 2 */}
                        <div>

                            <label
                                htmlFor="addressLine2"
                                className="block text-sm font-bold text-neutral-900 mb-2"
                            >
                                Street / Area / Sector
                            </label>

                            <div className="relative">

                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none flex items-center justify-center">
                                    <MapPin size={18} strokeWidth={1.8} />
                                </div>

                                <input
                                    id="addressLine2"
                                    type="text"
                                    name="addressLine2"
                                    placeholder="Area, Street, Sector, Village"
                                    value={formData.addressLine2}
                                    onChange={handleChange}
                                    autoComplete="address-line2"
                                    className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                />

                            </div>

                        </div>

                        {/* Landmark */}
                        <div>

                            <label
                                htmlFor="landmark"
                                className="block text-sm font-bold text-neutral-900 mb-2"
                            >
                                Landmark{' '}
                                <span className="text-neutral-400 font-normal">
                                    (Optional)
                                </span>
                            </label>

                            <input
                                id="landmark"
                                type="text"
                                name="landmark"
                                placeholder="E.g. Near Metro Station, Behind Park"
                                value={formData.landmark}
                                onChange={handleChange}
                                className="w-full h-11 sm:h-12 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                            />

                        </div>

                        {/* City, State, Pincode */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                            {/* City */}
                            <div>

                                <label
                                    htmlFor="city"
                                    className="block text-sm font-bold text-neutral-900 mb-2"
                                >
                                    City
                                </label>

                                <input
                                    id="city"
                                    type="text"
                                    name="city"
                                    placeholder="Town / City"
                                    value={formData.city}
                                    onChange={handleChange}
                                    autoComplete="address-level2"
                                    required
                                    aria-invalid={!!fieldErrors.city}
                                    aria-describedby={
                                        fieldErrors.city
                                            ? 'city-error'
                                            : undefined
                                    }
                                    className={`w-full h-11 sm:h-12 px-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                                        fieldErrors.city
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                    }`}
                                />

                                {fieldErrors.city && (
                                    <p
                                        id="city-error"
                                        className="text-red-600 text-xs mt-1.5"
                                    >
                                        {fieldErrors.city}
                                    </p>
                                )}

                            </div>

                            {/* State */}
                            <div>

                                <label
                                    htmlFor="state"
                                    className="block text-sm font-bold text-neutral-900 mb-2"
                                >
                                    State
                                </label>

                                <input
                                    id="state"
                                    type="text"
                                    name="state"
                                    placeholder="State"
                                    value={formData.state}
                                    onChange={handleChange}
                                    autoComplete="address-level1"
                                    required
                                    aria-invalid={!!fieldErrors.state}
                                    aria-describedby={
                                        fieldErrors.state
                                            ? 'state-error'
                                            : undefined
                                    }
                                    className={`w-full h-11 sm:h-12 px-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                                        fieldErrors.state
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                    }`}
                                />

                                {fieldErrors.state && (
                                    <p
                                        id="state-error"
                                        className="text-red-600 text-xs mt-1.5"
                                    >
                                        {fieldErrors.state}
                                    </p>
                                )}

                            </div>

                            {/* Pincode */}
                            <div>

                                <label
                                    htmlFor="pincode"
                                    className="block text-sm font-bold text-neutral-900 mb-2"
                                >
                                    Pincode
                                </label>

                                <input
                                    id="pincode"
                                    type="text"
                                    inputMode="numeric"
                                    name="pincode"
                                    placeholder="6-digit pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    autoComplete="postal-code"
                                    maxLength={6}
                                    required
                                    aria-invalid={!!fieldErrors.pincode}
                                    aria-describedby={
                                        fieldErrors.pincode
                                            ? 'pincode-error'
                                            : undefined
                                    }
                                    className={`w-full h-11 sm:h-12 px-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 shadow-xs ${
                                        fieldErrors.pincode
                                            ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                            : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                    }`}
                                />

                                {fieldErrors.pincode && (
                                    <p
                                        id="pincode-error"
                                        className="text-red-600 text-xs mt-1.5"
                                    >
                                        {fieldErrors.pincode}
                                    </p>
                                )}

                            </div>

                        </div>

                        {/* Address Type */}
                        <div>

                            <label
                                htmlFor="addressType"
                                className="block text-sm font-bold text-neutral-900 mb-2"
                            >
                                Address Type
                            </label>

                            <select
                                id="addressType"
                                name="addressType"
                                value={formData.addressType}
                                onChange={handleChange}
                                aria-invalid={!!fieldErrors.addressType}
                                aria-describedby={
                                    fieldErrors.addressType
                                        ? 'addressType-error'
                                        : undefined
                                }
                                className={`w-full h-11 sm:h-12 px-4 bg-white border rounded-lg text-sm text-neutral-900 outline-none transition-all duration-200 shadow-xs cursor-pointer ${
                                    fieldErrors.addressType
                                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                                        : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900'
                                }`}
                            >

                                <option value="Home">
                                    Home (All-day delivery)
                                </option>

                                <option value="Work">
                                    Work (Delivery between 10 AM - 5 PM)
                                </option>

                                <option value="Other">
                                    Other
                                </option>

                            </select>

                            {fieldErrors.addressType && (
                                <p
                                    id="addressType-error"
                                    className="text-red-600 text-xs mt-1.5"
                                >
                                    {fieldErrors.addressType}
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
                                onClick={() => navigate('/profile/addresses')}
                                disabled={saving}
                                className="w-full sm:flex-1 h-12 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 shadow-xs flex items-center justify-center"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full sm:flex-1 h-12 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                            >
                                {saving ? 'Updating...' : 'Update Address'}
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default EditAddress;