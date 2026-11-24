import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import VerifyOtp from './features/auth/pages/VerifyOtp';
import Home from './features/auth/pages/home';
import ProtectedRoute from './features/auth/components/ProtectedRoute';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
<Route element={<ProtectedRoute />}>
    <Route path="/home" element={<Home />} />
</Route>            </Routes>
        </BrowserRouter>
    );
}

export default App;
