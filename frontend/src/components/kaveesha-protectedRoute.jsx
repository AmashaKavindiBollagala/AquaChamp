import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function KaveeshaProtectedRoute({ children }) {
  const navigate = useNavigate();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuthorization = () => {
      // Get token and roles from localStorage
      const token = localStorage.getItem("aquachamp_token") || localStorage.getItem("superAdminToken");
      const rolesStr = localStorage.getItem("adminRoles");
      
      if (!token) {
        console.log("❌ No token found, redirecting to admin login");
        navigate("/admin-login");
        return;
      }

      if (!rolesStr) {
        console.log("❌ No roles found, redirecting to admin login");
        navigate("/admin-login");
        return;
      }

      try {
        const roles = JSON.parse(rolesStr);
        console.log("🔍 Checking lesson admin access. Roles:", roles);

        // Only allow Lesson_ADMIN or Lessons_ADMIN
        const isLessonAdmin = roles.includes("Lesson_ADMIN") || roles.includes("Lessons_ADMIN");
        
        if (!isLessonAdmin) {
          console.log("❌ Not a Lesson admin, redirecting to admin login");
          // Clear tokens to prevent access
          localStorage.removeItem("aquachamp_token");
          localStorage.removeItem("superAdminToken");
          localStorage.removeItem("adminRoles");
          localStorage.removeItem("adminUsername");
          navigate("/admin-login");
          return;
        }

        console.log("✅ Authorized: Lesson admin access granted");
        setAuthorized(true);
      } catch (error) {
        console.error("❌ Error parsing roles:", error);
        navigate("/admin-login");
      }
    };

    checkAuthorization();
  }, [navigate]);

  if (!authorized) {
    return (
      <div style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          background: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#1e293b", marginBottom: "8px" }}>
            Verifying Access...
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            Please wait while we verify your credentials
          </p>
        </div>
      </div>
    );
  }

  return children;
}
