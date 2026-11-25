import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  CheckCircle2,
  ArrowLeft,
  Home as HomeIcon,
  Briefcase,
  Phone,
  User,
} from "lucide-react";
import api from "../../../axios/axios";

function Addresses() {
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);
  const [settingDefaultId, setSettingDefaultId] = useState(null);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("/addresses");
      setAddresses(response.data.addresses);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (addressId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) return;

    try {
      setDeletingId(addressId);
      setError("");

      await api.delete(`/addresses/${addressId}`);
      await fetchAddresses();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete address");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setSettingDefaultId(addressId);
      setError("");

      await api.patch(`/addresses/${addressId}/default`);
      await fetchAddresses();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to set default address",
      );
    } finally {
      setSettingDefaultId(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadInitialAddresses = async () => {
      try {
        const response = await api.get("/addresses");
        if (isMounted) {
          setAddresses(response.data.addresses);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to fetch addresses");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInitialAddresses();

    return () => {
      isMounted = false;
    };
  }, []);

  const getAddressIcon = (type) => {
    switch (type) {
      case "Home":
        return <HomeIcon size={14} />;
      case "Work":
        return <Briefcase size={14} />;
      default:
        return <MapPin size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-4 w-28 bg-neutral-200 rounded animate-pulse" />
          <div className="flex justify-between items-center">
            <div className="h-8 w-44 bg-neutral-200 rounded animate-pulse" />
            <div className="h-10 w-36 bg-neutral-200 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="h-56 bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs animate-pulse" />
            <div className="h-56 bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-xs animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back to Profile Link */}
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Profile</span>
          </Link>
        </div>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              Saved <span className="text-[#8B1D2C]">Addresses</span>
            </h1>
            <p className="text-neutral-500 text-sm mt-1">
              Manage your delivery locations and default shipping address.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile/addresses/add")}
            className="inline-flex items-center justify-center gap-2 bg-[#141414] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-neutral-800 hover:shadow-md shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Add New Address</span>
          </button>
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

        {/* Empty State */}
        {!error && addresses.length === 0 && (
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-8 sm:p-12 text-center shadow-xs">
            <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mx-auto mb-4">
              <MapPin size={26} strokeWidth={1.8} />
            </div>
            <h2 className="text-lg font-bold text-neutral-900 mb-1">
              No saved addresses found
            </h2>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto mb-6">
              You haven't added any shipping addresses yet. Add one now for faster checkout.
            </p>
            <button
              type="button"
              onClick={() => navigate("/profile/addresses/add")}
              className="inline-flex items-center justify-center gap-2 bg-[#141414] text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              <Plus size={16} />
              <span>Add Address</span>
            </button>
          </div>
        )}

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {addresses.map((address) => (
            <div
              key={address._id}
              className={`bg-white border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-md relative ${
                address.isDefault
                  ? "border-[#8B1D2C]/40 ring-1 ring-[#8B1D2C]/20"
                  : "border-neutral-200/90"
              }`}
            >
              <div>
                {/* Card Top: Address Type & Default Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neutral-100 text-neutral-700 border border-neutral-200/80">
                    {getAddressIcon(address.addressType)}
                    <span>{address.addressType}</span>
                  </span>

                  {address.isDefault && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#8B1D2C]/10 text-[#8B1D2C] border border-[#8B1D2C]/20">
                      <CheckCircle2 size={13} />
                      <span>Default</span>
                    </span>
                  )}
                </div>

                {/* Recipient Name */}
                <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight flex items-center gap-2">
                  <User size={16} className="text-neutral-400 shrink-0" />
                  <span>{address.fullName}</span>
                </h3>

                {/* Contact Phone */}
                <p className="text-xs sm:text-sm text-neutral-500 font-medium flex items-center gap-2 mt-1">
                  <Phone size={14} className="text-neutral-400 shrink-0" />
                  <span>{address.phone}</span>
                </p>

                {/* Street Details */}
                <div className="text-xs sm:text-sm text-neutral-600 mt-3 pt-3 border-t border-neutral-100 space-y-1 leading-relaxed">
                  <p className="font-medium text-neutral-800">
                    {address.addressLine1}
                  </p>
                  {address.addressLine2 && <p>{address.addressLine2}</p>}
                  {address.landmark && (
                    <p className="text-neutral-400 text-xs">
                      Landmark: {address.landmark}
                    </p>
                  )}
                  <p className="text-neutral-800 font-medium">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                  <p className="text-neutral-500">{address.country}</p>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="pt-4 mt-5 border-t border-neutral-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/profile/addresses/edit/${address._id}`)
                    }
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-neutral-100"
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(address._id)}
                    disabled={deletingId !== null || settingDefaultId !== null}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-red-600 hover:text-red-700 transition-colors cursor-pointer py-1.5 px-2.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    <span>
                      {deletingId === address._id ? "Deleting..." : "Delete"}
                    </span>
                  </button>
                </div>

                {!address.isDefault && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(address._id)}
                    disabled={settingDefaultId !== null || deletingId !== null}
                    className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-[#8B1D2C] hover:text-[#701723] hover:underline transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-[#8B1D2C]/5 disabled:opacity-50"
                  >
                    <span>
                      {settingDefaultId === address._id
                        ? "Updating..."
                        : "Set as Default"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Addresses;
