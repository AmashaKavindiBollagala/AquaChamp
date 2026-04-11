import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";

// ── New shared components ────────────────────────────────────────────────────
import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import HomePage from "./pages/home.jsx";

// ── Existing components (unchanged) ─────────────────────────────────────────
import BadgeAnimation from "./components/dushani-BadgeAnimation";
import UserLogin from "./pages/amasha-login";
import UserRegistration from "./pages/User-Registration";
import KaveeshaUserProfile from "./pages/kaveesha-userProfile";
import DushaniStudentProgress from "./pages/dushani-studentProgress";
import DilsharaSuperAdminDashboard from "./pages/dilshara-SuperAdminDashboard";
import DilsharaAdminLogin from "./pages/dilshara-AdminLogin";
import VerifyEmail from "./pages/kaveesha-verifyEmail";
import EmailVerified from "./pages/kaveesha-emailVerified";
import ResetPassword from "./pages/kaveesha-resetPassword";
import DilsharaGameAdminDashboard from "./components/dilshara-gameAdmin-dashboard";
import GamePlayScreen from "./components/dilshara-GamePlayScreen";
import GameSelectionPage from "./components/dilshara-GameSelectionPage";
import ActivityAdminDashboard from "./components/amasha-ActivityAdminDashboard";
import UserActivityView from "./components/amasha-UserActivityView";
import UserWaterView from "./components/amasha-userWaterView.jsx";
import Sidebar from "./components/dushani-Sidebar.jsx";
import OverviewPage from "./components/dushani-ProgressAdmin_Dashboard.jsx";
import BadgesPage from "./components/dushani-Badges.jsx";
import LevelsPage from "./components/dushani-Levels.jsx";
import ProgressPage from "./components/dushani-StudentProgress.jsx";
import PublicLeaderboard from "./components/dushani-PublicLeaderboard.jsx";
import KaveeshaLessonsDashboard from "./components/kaveesha-lessonsDashboard";
import KaveeshaStudentDashboard from "./components/kaveesha-studentDashboard";
import KaveeshaTopicDetail from "./components/kaveesha-topicDetail";
import KaveeshaSubtopicLearn from "./components/kaveesha-subtopicLearn";
import KaveeshaStudentProgress from "./components/kaveesha-studentProgress";
import KaveeshaProtectedRoute from "./components/kaveesha-protectedRoute";

// ── Dashboard layout (unchanged) ─────────────────────────────────────────────
function DashboardLayout() {
  const [activePage, setActivePage] = useState("overview");
  const pages = {
    overview: <OverviewPage />,
    badges:   <BadgesPage />,
    levels:   <LevelsPage />,
    progress: <ProgressPage />,
  };
  return (
    <div className="flex h-screen min-h-145 overflow-hidden border border-gray-200 rounded-xl font-sans">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 overflow-y-auto bg-gray-50">{pages[activePage]}</div>
    </div>
  );
}

// ── Routes where Header & Footer should NOT appear ───────────────────────────
// (admin dashboards, login, auth pages — pages that have their own full layout)
const NO_SHELL_ROUTES = [
  "/login",
  "/register",
  "/admin-login",
  "/super-admin",
  "/game-dashboard",
  "/activity-dashboard",
  "/dashboard",
  "/progress-dashboard",
  "/lesson-dashboard",
  "/verify-email",
  "/email-verified",
];

function AppShell({ children }) {
  const { pathname } = useLocation();
  const hideShell =
    NO_SHELL_ROUTES.includes(pathname) ||
    pathname.startsWith("/reset-password") ||
    pathname.startsWith("/games/");

  return (
    <>
      {!hideShell && <Header />}
      <main>{children}</main>
      {!hideShell && <Footer />}
    </>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      {/* Badge animation works across all pages */}
      <BadgeAnimation />

      <AppShell>
        <Routes>
          {/* ── Public home ── */}
          <Route path="/"       element={<HomePage />} />
          <Route path="/home"   element={<HomePage />} />

          {/* ── Auth ── */}
          <Route path="/login"          element={<UserLogin />} />
          <Route path="/register"       element={<UserRegistration />} />
          <Route path="/verify-email"   element={<VerifyEmail />} />
          <Route path="/email-verified" element={<EmailVerified />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── Student pages (Header + Footer visible) ── */}
          <Route path="/profile"      element={<KaveeshaUserProfile />} />
          <Route path="/my-progress"  element={<DushaniStudentProgress />} />
          <Route path="/water"        element={<UserWaterView />} />
          <Route path="/my-activities"element={<UserActivityView />} />
          <Route path="/leaderboard"  element={<PublicLeaderboard />} />

          <Route path="/student/dashboard"          element={<KaveeshaStudentDashboard />} />
          <Route path="/student/topic/:topicId"     element={<KaveeshaTopicDetail />} />
          <Route path="/student/subtopic/:subtopicId" element={<KaveeshaSubtopicLearn />} />
          <Route path="/student/progress"           element={<KaveeshaStudentProgress />} />

          {/* ── Admin / dashboard pages (no Header/Footer) ── */}
          <Route path="/super-admin"        element={<DilsharaSuperAdminDashboard />} />
          <Route path="/admin-login"        element={<DilsharaAdminLogin />} />
          <Route path="/activity-dashboard" element={<ActivityAdminDashboard />} />
          <Route path="/game-dashboard"     element={<DilsharaGameAdminDashboard />} />
          <Route path="/games/topic/:topicId" element={<GameSelectionPage />} />
          <Route path="/games/play/:gameId"   element={<GamePlayScreen />} />
          <Route path="/dashboard"          element={<DashboardLayout />} />
          <Route path="/progress-dashboard" element={<DashboardLayout />} />

          <Route
            path="/lesson-dashboard"
            element={
              <KaveeshaProtectedRoute>
                <KaveeshaLessonsDashboard />
              </KaveeshaProtectedRoute>
            }
          />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
}

export default App;