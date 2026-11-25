import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Phone, MapPin, Building } from 'lucide-react';
import api from '../../../axios/axios';

function AddAddress() {

    const navigate = useNavigate();

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

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');

        if (!/^[6-9]\d{9}$/.test(formData.phone.trim())) {
            setError('Enter a valid phone number');
            return;
        }

        if (!/^[1-9]\d{5}$/.test(formData.pincode.trim())) {
            setError('Enter a valid pincode');
            return;
        }

        try {
            setLoading(true);

            await api.post('/addresses', formData);

            navigate('/profile/addresses');

        } catch (err) {
            setError(
                err.response?.data?.message ||
                'Failed to add address'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">

            <div className="max-w-2xl mx-auto">

                {/* Back Link */}
                <div className="mb-4">
                    <Link
                        to="/profile/addresses"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        <span>Back to Addresses</span>
                    </Link>
                </div>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 mb-1">
                        Add New <span className="text-[#8B1D2C]">Address</span>
                    </h1>
                    <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
                        Enter your delivery destination and contact information.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs p-6 sm:p-8">

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Contact Info (2 columns) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
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
                                        required
                                        className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                    />
                                </div>
                            </div>

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
                                        maxLength={10}
                                        required
                                        className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Street Address Line 1 */}
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
                                    required
                                    className="w-full h-11 sm:h-12 pl-11 pr-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                />
                            </div>
                        </div>

                        {/* Street Address Line 2 */}
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
                                Landmark <span className="text-neutral-400 font-normal">(Optional)</span>
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

                        {/* City, State, Pincode (3 columns on desktop) */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                                    required
                                    className="w-full h-11 sm:h-12 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                />
                            </div>

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
                                    required
                                    className="w-full h-11 sm:h-12 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                />
                            </div>

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
                                    name="pincode"
                                    placeholder="6-digit pincode"
                                    value={formData.pincode}
                                    onChange={handleChange}
                                    maxLength={6}
                                    required
                                    className="w-full h-11 sm:h-12 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs"
                                />
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
                                className="w-full h-11 sm:h-12 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 outline-none transition-all duration-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 shadow-xs cursor-pointer"
                            >
                                <option value="Home">Home (All-day delivery)</option>
                                <option value="Work">Work (Delivery between 10 AM - 5 PM)</option>
                                <option value="Other">Other</option>
                            </select>
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

                        {/* Actions */}
                        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/profile/addresses')}
                                disabled={loading}
                                className="w-full sm:flex-1 h-12 bg-white border border-neutral-200 text-neutral-800 rounded-lg text-sm sm:text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 disabled:opacity-50 shadow-xs flex items-center justify-center"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full sm:flex-1 h-12 bg-[#141414] text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-200 hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : 'Save Address'}
                            </button>
                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default AddAddress;
