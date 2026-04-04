import { BrowserRouter, Routes, Route } from "react-router-dom";
import UserLogin from "./pages/amasha-login";
import UserRegistration from "./pages/User-Registration";
import KaveeshaUserProfile from "./pages/kaveesha-userProfile";

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;