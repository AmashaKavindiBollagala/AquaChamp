import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";

// ── New shared components ────────────────────────────────────────────────────
import Header from "./components/header.jsx";
import Footer from "./components/footer.jsx";
import HomePage from "./pages/home.jsx";
import AboutPage from "./pages/about-us.jsx";

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

// ─────────────────────────────────────────────────────────────────────────────
// 🔒 TOKEN HELPER — checks all storage + validates JWT is not expired
// ─────────────────────────────────────────────────────────────────────────────
function getValidToken() {
  const token =
    localStorage.getItem("aquachamp_token") ||
    localStorage.getItem("superAdminToken") ||
    sessionStorage.getItem("aquachamp_token");

  if (!token) return null;

  // Decode JWT and check expiry without any library
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      // Expired — wipe all storage so stale tokens don't block login
      localStorage.removeItem("aquachamp_token");
      localStorage.removeItem("superAdminToken");
      sessionStorage.removeItem("aquachamp_token");
      return null;
    }
  } catch {
    // Malformed token — clear it
    localStorage.removeItem("aquachamp_token");
    localStorage.removeItem("superAdminToken");
    sessionStorage.removeItem("aquachamp_token");
    return null;
  }

  return token;
}

// ─────────────────────────────────────────────────────────────────────────────
// 🔒 PRIVATE ROUTE — redirects to /login if no valid token
// ─────────────────────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const token = getValidToken();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// ── Dashboard layout ──────────────────────────────────────────────────────────
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

// ── Routes where Header & Footer should NOT appear ────────────────────────────
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
      <BadgeAnimation />

      <AppShell>
        <Routes>

          {/* ── Public pages ── */}
          <Route path="/"      element={<HomePage />} />
          <Route path="/home"  element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* ── Auth pages ── */}
          <Route path="/login"                 element={<UserLogin />} />
          <Route path="/register"              element={<UserRegistration />} />
          <Route path="/verify-email"          element={<VerifyEmail />} />
          <Route path="/email-verified"        element={<EmailVerified />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* ── 🔒 Protected student pages ── */}
          <Route path="/profile" element={
            <PrivateRoute><KaveeshaUserProfile /></PrivateRoute>
          } />
          <Route path="/my-progress" element={
            <PrivateRoute><DushaniStudentProgress /></PrivateRoute>
          } />
          <Route path="/water" element={
            <PrivateRoute><UserWaterView /></PrivateRoute>
          } />
          <Route path="/my-activities" element={
            <PrivateRoute><UserActivityView /></PrivateRoute>
          } />
          <Route path="/leaderboard" element={
            <PrivateRoute><PublicLeaderboard /></PrivateRoute>
          } />
          <Route path="/student/dashboard" element={
            <PrivateRoute><KaveeshaStudentDashboard /></PrivateRoute>
          } />
          <Route path="/student/topic/:topicId" element={
            <PrivateRoute><KaveeshaTopicDetail /></PrivateRoute>
          } />
          <Route path="/student/subtopic/:subtopicId" element={
            <PrivateRoute><KaveeshaSubtopicLearn /></PrivateRoute>
          } />
          <Route path="/student/progress" element={
            <PrivateRoute><KaveeshaStudentProgress /></PrivateRoute>
          } />

          {/* ── Admin / dashboard pages (no Header/Footer) ── */}
          <Route path="/super-admin"          element={<DilsharaSuperAdminDashboard />} />
          <Route path="/admin-login"          element={<DilsharaAdminLogin />} />
          <Route path="/activity-dashboard"   element={<ActivityAdminDashboard />} />
          <Route path="/game-dashboard"       element={<DilsharaGameAdminDashboard />} />
          <Route path="/games/topic/:topicId" element={<GameSelectionPage />} />
          <Route path="/games/play/:gameId"   element={<GamePlayScreen />} />
          <Route path="/dashboard"            element={<DashboardLayout />} />
          <Route path="/progress-dashboard"   element={<DashboardLayout />} />

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