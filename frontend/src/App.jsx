import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLogin from "./pages/amasha-login";
import UserRegistration from "./pages/User-Registration";
import KaveeshaUserProfile from "./pages/kaveesha-userProfile";
import DilsharaSuperAdminDashboard from "./pages/dilshara-SuperAdminDashboard";
import DilsharaAdminLogin from "./pages/dilshara-AdminLogin";
import VerifyEmail from "./pages/kaveesha-verifyEmail";
import EmailVerified from "./pages/kaveesha-emailVerified";
import ResetPassword from "./pages/kaveesha-resetPassword";
import ActivityAdminDashboard from "./components/amasha-ActivityAdminDashboard";
import UserActivityView from "./components/amasha-UserActivityView";


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
       <Route path="/activity-dashboard" element={<ActivityAdminDashboard />} />
       <Route path="/my-activities" element={<UserActivityView />} />


        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verified" element={<EmailVerified />} />
        
        {/* Reset Password page */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;