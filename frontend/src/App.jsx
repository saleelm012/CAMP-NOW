import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './features/auth/pages/Login';
import Register from './features/auth/pages/Register';
import VerifyOtp from './features/auth/pages/VerifyOtp';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
