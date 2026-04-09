import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

// Existing pages
import UserLogin from "./pages/amasha-login";
import UserRegistration from "./pages/User-Registration";
import KaveeshaUserProfile from "./pages/kaveesha-userProfile";
import DilsharaSuperAdminDashboard from "./pages/dilshara-SuperAdminDashboard";
import DilsharaAdminLogin from "./pages/dilshara-AdminLogin";
import VerifyEmail from "./pages/kaveesha-verifyEmail";
import EmailVerified from "./pages/kaveesha-emailVerified";
import ResetPassword from "./pages/kaveesha-resetPassword";

// Dashboard pages
import Sidebar from "./components/dushani-Sidebar.jsx";
import OverviewPage from "./components/dushani-ProgressAdmin_Dashboard.jsx";
import BadgesPage from "./components/dushani-Badges.jsx";
import LevelsPage from "./components/dushani-Levels.jsx";
import ProgressPage from "./components/dushani-StudentProgress.jsx";
import PublicLeaderboard from "./components/dushani-PublicLeaderboard.jsx";

function DashboardLayout() {
  const [activePage, setActivePage] = useState("overview");

  const pages = {
    overview: <OverviewPage />,
    badges: <BadgesPage />,
    levels: <LevelsPage />,
    progress: <ProgressPage />,
  };

  return (
    <div className="flex h-screen min-h-[580px] overflow-hidden border border-gray-200 rounded-xl font-sans">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {pages[activePage]}
      </div>
    </div>
  );
}

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

        {/* Super Admin Dashboard */}
        <Route path="/super-admin" element={<DilsharaSuperAdminDashboard />} />

        {/* Admin Login */}
        <Route path="/admin-login" element={<DilsharaAdminLogin />} />

        {/* Email Verification */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/email-verified" element={<EmailVerified />} />

        {/* Reset Password */}
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* New Dashboard with Sidebar */}
        <Route path="/dashboard" element={<DashboardLayout />} />
        <Route path="/progress-dashboard" element={<DashboardLayout />} />

        {/* Public Leaderboard (No Sidebar) */}
        <Route path="/leaderboard" element={<PublicLeaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;