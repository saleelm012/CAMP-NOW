import { useState, useEffect, useRef } from "react";
import {
  User,
  Mail,
  Phone,
  Camera,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import api from "../../../axios/axios";
import { useNavigate } from "react-router-dom";

const SERVER_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [imageError, setImageError] = useState(false);

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async () => {
      try {
        const response = await api.get("/auth/me");

        if (cancelled) return;

        setUser(response.data.user);

      } catch (err) {

        if (cancelled) return;

        setError(
          err.response?.data?.message ||
          "Failed to fetch profile"
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

  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => {
        setUploadSuccess("");
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  const handleImageUpload = async (e) => {

    if (uploading) return;

    const file = e.target.files?.[0];

    if (!file) return;

    setUploadError("");
    setUploadSuccess("");

    // File type validation
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {

      setUploadError(
        "Only JPG, PNG and WEBP images are allowed"
      );

      e.target.value = "";
      return;
    }

    // Empty file validation
    if (file.size === 0) {

      setUploadError("Selected image is empty");

      e.target.value = "";
      return;
    }

    // File size validation
    if (file.size > 2 * 1024 * 1024) {

      setUploadError("Image size must not exceed 2 MB");

      e.target.value = "";
      return;
    }

    const formData = new FormData();

    formData.append("profileImage", file);

    try {

      setUploading(true);

      const response = await api.patch(
        "/auth/profile/image",
        formData
      );

      setUser((prev) => ({
        ...prev,
        ...response.data.user,
      }));

      setImageError(false);

      setUploadSuccess(
        "Profile image updated successfully"
      );

    } catch (err) {

      setUploadError(
        err.response?.data?.message ||
        "Image upload failed"
      );

    } finally {

      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    }
  };

  // Loading Skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">

        <div className="max-w-3xl mx-auto space-y-6">

          <div className="h-8 w-44 bg-neutral-200 rounded-md animate-pulse" />

          <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs animate-pulse">

            <div className="flex items-center gap-5">

              <div className="w-20 h-20 rounded-full bg-neutral-200" />

              <div className="space-y-2">

                <div className="h-6 w-36 bg-neutral-200 rounded" />

                <div className="h-4 w-24 bg-neutral-100 rounded" />

              </div>

            </div>

            <div className="space-y-4 pt-4 border-t border-neutral-100">

              <div className="h-12 bg-neutral-100 rounded-xl" />

              <div className="h-12 bg-neutral-100 rounded-xl" />

              <div className="h-12 bg-neutral-100 rounded-xl" />

            </div>

          </div>

        </div>

      </div>
    );
  }

  // Profile Fetch Error
  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#FBFBFC] flex items-center justify-center p-6">

        <div className="max-w-md w-full bg-white border border-neutral-200/90 rounded-2xl p-8 text-center shadow-xs">

          <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">

            <User size={24} />

          </div>

          <h2 className="text-xl font-bold text-neutral-900 mb-2">
            Profile Error
          </h2>

          <p
            role="alert"
            className="text-neutral-500 text-sm mb-6"
          >
            {error || "Profile not found"}
          </p>

          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="inline-flex items-center justify-center w-full h-11 bg-[#141414] text-white rounded-lg text-sm font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
          >
            Go to Login
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBFBFC] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">

      <div className="max-w-3xl mx-auto space-y-6">

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
              My <span className="text-[#8B1D2C]">Profile</span>
            </h1>

            <p className="text-neutral-500 text-sm mt-1">
              Manage your account details and personal preferences.
            </p>

          </div>

          <button
            type="button"
            onClick={() => navigate("/profile/edit")}
            disabled={uploading}
            className="inline-flex items-center justify-center gap-2 bg-[#141414] text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 hover:bg-neutral-800 hover:shadow-md shadow-xs self-start sm:self-auto cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >

            <Edit3 size={16} />

            <span>Edit Profile</span>

          </button>

        </div>

        {/* Main Profile Card */}
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-xs overflow-hidden">

          {/* Decorative Header Banner */}
          <div className="h-28 sm:h-32 bg-linear-to-r from-neutral-900 via-[#8B1D2C] to-neutral-950 relative">

            <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-xs font-semibold tracking-wide border border-white/15">

              <ShieldCheck
                size={14}
                className="text-[#E5A8B0]"
              />

              <span>
                {user.isEmailVerified
                  ? "Verified Account"
                  : "Unverified Account"}
              </span>

            </div>

          </div>

          {/* Card Body */}
          <div className="px-6 sm:px-8 pb-8 pt-0">

            {/* Avatar & User Summary */}
            <div className="-mt-14 sm:-mt-16 mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">

              <div className="flex flex-col sm:flex-row sm:items-end gap-5">

                {/* Profile Picture */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white shadow-md bg-neutral-100 overflow-hidden shrink-0">

                  <div className="w-full h-full flex items-center justify-center bg-neutral-100 text-neutral-400">

                    {user.profileImage && !imageError ? (

                      <img
                        src={`${SERVER_URL}${user.profileImage}`}
                        alt="Profile"
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <User
                        size={44}
                        strokeWidth={1.6}
                      />

                    )}

                  </div>

                  {/* Uploading Spinner */}
                  {uploading && (

                    <div
                      role="status"
                      className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white"
                    >

                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mb-1" />

                      <span className="text-[10px] font-bold">
                        Uploading
                      </span>

                    </div>

                  )}

                  {/* Camera Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    aria-label="Change profile photo"
                    title="Change profile photo"
                    className="absolute bottom-1 right-1 bg-[#141414] text-white p-2 rounded-full border-2 border-white hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                  >

                    <Camera
                      size={13}
                      strokeWidth={2.2}
                    />

                  </button>

                  {/* Hidden File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />

                </div>

                {/* User Name & Account Type */}
                <div className="space-y-1">

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                    {user.name}
                  </h2>

                  <p className="text-neutral-500 text-sm font-medium">
                    Customer Account • Football Store
                  </p>

                </div>

              </div>

            </div>

            {/* Image Upload Error */}
            {uploadError && (

              <p
                role="alert"
                className="mb-5 text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-lg text-sm font-medium"
              >
                {uploadError}
              </p>

            )}

            {/* Image Upload Success */}
            {uploadSuccess && (
              <div
                role="status"
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-white border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-md text-xs font-medium whitespace-nowrap"
              >
                <CheckCircle2 size={16} />
                <span>{uploadSuccess}</span>
              </div>
            )}
            {/* Details Section */}
            <div className="space-y-4">

              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Personal Information
              </h3>

              {/* Full Name Tile */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100 transition-all duration-200 hover:bg-neutral-100/60">

                <div className="flex items-center gap-4">

                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 shadow-2xs shrink-0">

                    <User
                      size={18}
                      strokeWidth={2}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-medium text-neutral-400">
                      Full Name
                    </p>

                    <p className="text-sm sm:text-base font-bold text-neutral-900">
                      {user.name}
                    </p>

                  </div>

                </div>

              </div>

              {/* Email Address Tile */}
              <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-100 transition-all duration-200 hover:bg-neutral-100/60">

                <div className="flex items-center gap-4 min-w-0">

                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 shadow-2xs shrink-0">

                    <Mail
                      size={18}
                      strokeWidth={2}
                    />

                  </div>

                  <div className="min-w-0">

                    <p className="text-xs font-medium text-neutral-400">
                      Email Address
                    </p>

                    <p className="text-sm sm:text-base font-bold text-neutral-900 break-all">
                      {user.email}
                    </p>

                  </div>

                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">

                  {user.isEmailVerified ? (

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">

                      <CheckCircle2 size={13} />

                      <span>Verified</span>

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      Unverified
                    </span>

                  )}

                  {/* Change Email */}
                  {user.authProvider !== "google" && (

                    <button
                      type="button"
                      onClick={() =>
                        navigate("/profile/change-email")
                      }
                      disabled={uploading}
                      className="text-xs font-semibold text-[#8B1D2C] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Change Email
                    </button>

                  )}

                </div>

              </div>

              {/* Phone Number Tile */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100 transition-all duration-200 hover:bg-neutral-100/60">

                <div className="flex items-center gap-4">

                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 shadow-2xs shrink-0">

                    <Phone
                      size={18}
                      strokeWidth={2}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-medium text-neutral-400">
                      Phone Number
                    </p>

                    <p className="text-sm sm:text-base font-bold text-neutral-900">
                      {user.phone || "Not provided"}
                    </p>

                  </div>

                </div>

              </div>

              {/* Saved Addresses Tile */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-neutral-50 border border-neutral-100 transition-all duration-200 hover:bg-neutral-100/60">

                <div className="flex items-center gap-4">

                  <div className="w-10 h-10 rounded-lg bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 shadow-2xs shrink-0">

                    <MapPin
                      size={18}
                      strokeWidth={2}
                    />

                  </div>

                  <div>

                    <p className="text-xs font-medium text-neutral-400">
                      Delivery Addresses
                    </p>

                    <p className="text-sm sm:text-base font-bold text-neutral-900">
                      Saved Addresses
                    </p>

                  </div>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate("/profile/addresses")
                  }
                  disabled={uploading}
                  className="text-xs font-semibold text-[#8B1D2C] hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Manage Addresses
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;