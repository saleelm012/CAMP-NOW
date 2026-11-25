import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import VerifyOtp from './features/auth/pages/VerifyOtp';
import Home from './features/auth/pages/home';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import ForgotPassword from './features/auth/pages/ForgotPassword';
import VerifyResetOtp from './features/auth/pages/VerifyResetOtp';
import ResetPassword from './features/auth/pages/ResetPassword';
import Profile from './features/profile/pages/Profile';
import EditProfile from './features/profile/pages/EditProfile';
import MainLayout from './layouts/MainLayout';
import ChangePassword from './features/profile/pages/ChangePassword';


function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                

<Route element={<ProtectedRoute />}>

    <Route element={<MainLayout />}>

        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />

          <Route
            path="/profile/change-password"
            element={<ChangePassword />}
        />

    </Route>
</Route>

<Route path="/forgot-password" element={<ForgotPassword />} />     
<Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
<Route path="/reset-password" element={<ResetPassword />} />

   </Routes>
        </BrowserRouter>
    );
}

export default App;
