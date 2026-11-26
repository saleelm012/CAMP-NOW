import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./features/auth/pages/Login";
import Register from "./features/auth/pages/Register";
import VerifyOtp from "./features/auth/pages/VerifyOtp";
import Home from "./features/auth/pages/home";
import ProtectedRoute from "./features/auth/components/ProtectedRoute";
import ForgotPassword from "./features/auth/pages/ForgotPassword";
import VerifyResetOtp from "./features/auth/pages/VerifyResetOtp";
import ResetPassword from "./features/auth/pages/ResetPassword";
import Profile from "./features/profile/pages/Profile";
import EditProfile from "./features/profile/pages/EditProfile";
import MainLayout from "./layouts/MainLayout";
import ChangePassword from "./features/profile/pages/ChangePassword";
import ChangeEmail from "./features/profile/pages/ChangeEmail";
import VerifyEmailChangeOtp from "./features/profile/pages/VerifyEmailChangeOtp";
import Addresses from "./features/profile/pages/Addresses";
import AddAddress from "./features/profile/pages/AddAddress";
import EditAddress from "./features/profile/pages/EditAddress";
import PublicRoute from "./features/auth/components/PublicRoute";
import AdminLogin from "./features/admin/pages/AdminLogin";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import AdminProtectedRoute from "./features/admin/components/AdminProtectedRoute";
import AdminPublicRoute from "./features/admin/components/AdminPublicRoute";
import AdminLayout from "./features/admin/layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Customer Public Routes */}

        <Route element={<PublicRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        <Route path="/verify-otp" element={<VerifyOtp />} />


        {/* Customer Protected Routes */}

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>

            <Route path="/home" element={<Home />} />

            <Route path="/profile" element={<Profile />} />

            <Route path="/profile/edit" element={<EditProfile />} />

            <Route path="/profile/addresses" element={<Addresses />} />

            <Route
              path="/profile/addresses/add"
              element={<AddAddress />}
            />

            <Route
              path="/profile/addresses/edit/:addressId"
              element={<EditAddress />}
            />

            <Route
              path="/profile/change-password"
              element={<ChangePassword />}
            />

            <Route
              path="/profile/change-email"
              element={<ChangeEmail />}
            />

            <Route
              path="/profile/verify-email-change"
              element={<VerifyEmailChangeOtp />}
            />

          </Route>
        </Route>


        {/* Forgot Password Routes */}

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/verify-reset-otp"
          element={<VerifyResetOtp />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* Admin Public Routes */}

        <Route element={<AdminPublicRoute />}>

          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

        </Route>


        {/* Admin Protected Routes */}

        <Route element={<AdminProtectedRoute />}>

          <Route element={<AdminLayout />}>

            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />

          </Route>

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;