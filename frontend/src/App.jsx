import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLogin from "./pages/amasha-login";
import UserRegistration from "./pages/User-Registration";
import KaveeshaUserProfile from "./pages/kaveesha-userProfile";
import DilsharaSuperAdminDashboard from "./pages/dilshara-SuperAdminDashboard";
import DilsharaAdminLogin from "./pages/dilshara-AdminLogin";
import VerifyEmail from "./pages/kaveesha-verifyEmail";
import EmailVerified from "./pages/kaveesha-emailVerified";
import ResetPassword from "./pages/kaveesha-resetPassword";
import DilsharaGameAdminDashboard from "./components/dilshara-gameAdmin-dashboard";
import GamePlayScreen from "./components/dilshara-GamePlayScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default page */}
        <Route path="/" element={<UserLogin />} />

        {/* Auth pages */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegistration />} />

        {/* Profile page */}
        <Route path="/profile" element={<KaveeshaUserProfile />} />

        {/* super admin dashboard */}
<Route path="/super-admin" element={<DilsharaSuperAdminDashboard />} />

{/* admin login*/}
<Route path="/admin-login" element={<DilsharaAdminLogin />} />


        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        
        {/* Reset Password page */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* game admin dashboard */}
        <Route path="/game-dashboard" element={<DilsharaGameAdminDashboard />} />
         {/* game with 3rd party api */}
        <Route path="/play/:gameId" element={<GamePlayScreen />} />


      </Routes>
    </BrowserRouter>
  );
}

export default App;