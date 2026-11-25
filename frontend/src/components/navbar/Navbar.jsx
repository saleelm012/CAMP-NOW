import { useState } from 'react';
import {
    UserRound,
    ShoppingCart,
    Heart,
    Search,
    ChevronDown,
    Package,
    MapPin,
    Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import api from '../../axios/axios';

function Navbar() {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const navigate = useNavigate();

const handleLogout = async () => {
    try {
        await api.post('/auth/logout');

        setIsDropdownOpen(false);

        navigate('/login', { replace: true });

    } catch (error) {
        console.error('Logout failed:', error);
        alert('Logout failed. Please try again.');
    }
};

    return (
        <nav className="flex items-center justify-between px-8 py-4 bg-white border-b">

            {/* Store Name */}
            <Link to="/home" className="text-2xl font-bold">
                CAMP NOU
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
                <Link to="/home">Home</Link>
                <Link to="/shop">Shop</Link>
                <Link to="/categories">Categories</Link>
            </div>

            {/* Navigation Icons */}
            <div className="flex items-center gap-5">

                <Search size={22} />

                <Heart size={22} />

                <ShoppingCart size={22} />

                {/* Profile Dropdown */}
                <div className="relative">

                    <button
                        type="button"
                        aria-label="Profile menu"
                        aria-expanded={isDropdownOpen}
                        onClick={() => setIsDropdownOpen(prev => !prev)}
                        className="flex items-center gap-1 cursor-pointer"
                    >
                        <UserRound size={22} />
                        <ChevronDown size={15} />
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-4 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg p-2 z-50">

                            <Link
                                to="/profile"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-100"
                            >
                                <UserRound size={18} />
                                My Profile
                            </Link>

                            <button
                                disabled
                                className="flex items-center gap-3 px-4 py-3 text-neutral-400 w-full"
                            >
                                <Package size={18} />
                                My Orders
                            </button>

                            <button
                                disabled
                                className="flex items-center gap-3 px-4 py-3 text-neutral-400 w-full"
                            >
                                <MapPin size={18} />
                                My Addresses
                            </button>

                            <Link
    to="/profile/change-password"
    onClick={() => setIsDropdownOpen(false)}
    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neutral-100"
>
    <Lock size={18} />
    Change Password
</Link>

                            <div className="border-t border-neutral-200 my-2" />

<button
    type="button"
    onClick={handleLogout}
    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
>
    <LogOut size={18} />
    Logout
</button>

                        </div>
                    )}

                </div>
            </div>

        </nav>
    );
}

export default Navbar;