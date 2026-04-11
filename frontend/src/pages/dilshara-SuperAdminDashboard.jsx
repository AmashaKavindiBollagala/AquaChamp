import { useState, useEffect } from "react";

const API_BASE = "http://localhost:4000";

const ROLE_CONFIG = {
  SUPER_ADMIN:    { bg: "#042C53", label: "Super Admin",    icon: "👑" },
  Game_ADMIN:     { bg: "#185FA5", label: "Game Admin",     icon: "🎮" },
  Progress_ADMIN: { bg: "#1D9E75", label: "Progress Admin", icon: "🏆" },
  Activity_ADMIN: { bg: "#EF9F27", label: "Activity Admin", icon: "💧" },
  Lesson_ADMIN:   { bg: "#6B5FCF", label: "Lesson Admin",   icon: "📚" },
  Lessons_ADMIN:  { bg: "#6B5FCF", label: "Lesson Admin",   icon: "📚" },
  User:           { bg: "#94a3b8", label: "User",           icon: "👤" },
};

const VALID_ROLES = ["Game_ADMIN", "Progress_ADMIN", "Activity_ADMIN", "Lesson_ADMIN"];

const getRoleConfig = (roles) => {
  if (!roles || roles.length === 0) return ROLE_CONFIG["User"];
  return ROLE_CONFIG[roles[0]] || { bg: "#185FA5", label: roles[0], icon: "🔑" };
};

const STAT_ROLES = [
  { role: "Game_ADMIN",     label: "Game Admins",     icon: "🎮", color: "#185FA5" },
  { role: "Progress_ADMIN", label: "Progress Admins", icon: "🏆", color: "#1D9E75" },
  { role: "Activity_ADMIN", label: "Activity Admins", icon: "💧", color: "#EF9F27" },
  { role: "Lesson_ADMIN",   label: "Lesson Admins",   icon: "📚", color: "#6B5FCF" },
];

const EMPTY_FORM = {
  firstName: "", lastName: "", age: "",
  email: "", username: "", password: "", roles: "",
};

// ── Validation
const validateForm = (form) => {
  const errors = {};

  if (!form.firstName.trim())
    errors.firstName = "First name is required";
  else if (!/^[a-zA-Z\s]+$/.test(form.firstName.trim()))
    errors.firstName = "Letters only";

  if (!form.lastName.trim())
    errors.lastName = "Last name is required";
  else if (!/^[a-zA-Z\s]+$/.test(form.lastName.trim()))
    errors.lastName = "Letters only";

  const age = Number(form.age);
  if (!form.age)
    errors.age = "Age is required";
  else if (!Number.isInteger(age) || age < 18 || age > 65)
    errors.age = "Age must be between 18 and 65";

  if (!form.email.trim())
    errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
    errors.email = "Enter a valid email address";

  if (!form.username.trim())
    errors.username = "Username is required";
  else if (form.username.length < 3)
    errors.username = "Min 3 characters";
  else if (/\s/.test(form.username))
    errors.username = "No spaces allowed";
  else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
    errors.username = "Letters, numbers and _ only";

  if (!form.password)
    errors.password = "Password is required";
  else if (form.password.length < 8)
    errors.password = "Min 8 characters";

  if (!form.roles)
    errors.roles = "Please select a role";
  else if (!VALID_ROLES.includes(form.roles))
    errors.roles = "Select a valid role from the list";

  return errors;
};

export default function DilsharaSuperAdminDashboard() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("ALL");
  const [form, setForm] = useState(EMPTY_FORM);

  const token = localStorage.getItem("superAdminToken");

  const fetchAdmins = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch admins");
      setAdmins(data.admins || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    // Clear field error on change
    if (fieldErrors[name]) setFieldErrors({ ...fieldErrors, [name]: "" });
    setFormError("");
  };

  const handleSubmit = async () => {
    setFormError("");
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError("Please fix the errors below.");
      return;
    }
    setFieldErrors({});
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, age: Number(form.age), roles: [form.roles] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create admin");
      setSuccessMsg(`✅ ${data.admin.firstName} (${form.roles}) created successfully!`);
      setForm(EMPTY_FORM);
      setFieldErrors({});
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (adminId, currentStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/${adminId}/toggle-active`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to toggle status");
      setSuccessMsg(`✅ Admin ${currentStatus ? "deactivated" : "activated"} successfully!`);
      fetchAdmins();
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setFormError("");
    setSuccessMsg("");
    setShowModal(true);
  };

  const filteredAdmins = admins.filter((admin) => {
    const matchSearch =
      admin.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "ALL" || admin.roles?.includes(filterRole);
    return matchSearch && matchRole;
  });

  // Helper: input class with error highlight
  const inputClass = (name) =>
    `w-full border ${fieldErrors[name] ? "border-red-400 bg-red-50" : "border-[#E6F1FB]"} rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#185FA5] focus:ring-2 focus:ring-[#185FA5] focus:ring-opacity-20 transition-all`;

  return (
    <div className="min-h-screen bg-[#E6F1FB]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap'); body { font-family: 'Sora', sans-serif; }`}</style>

      {/* Navbar */}
      <nav className="bg-[#042C53] px-8 py-4 flex items-center justify-between shadow-xl sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-xl">AquaChamp</span>
          <span className="ml-2 px-3 py-1 bg-[#EF9F27] text-white text-xs font-bold rounded-full tracking-wider">SUPER ADMIN</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white bg-opacity-10 px-4 py-2 rounded-xl">
            <div className="w-7 h-7 rounded-full bg-[#EF9F27] flex items-center justify-center text-white text-xs font-bold">S</div>
            <span className="text-[#E6F1FB] text-sm font-medium">Super Admin</span>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("superAdminToken");
              localStorage.removeItem("adminRoles");
              localStorage.removeItem("adminUsername");
              window.location.href = "/admin-login";
            }}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Success Message */}
        {successMsg && (
          <div className="mb-6 bg-[#E1F5EE] border-l-4 border-[#1D9E75] text-[#1D9E75] px-5 py-4 rounded-xl font-semibold flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg("")} className="text-xl font-bold hover:opacity-70">×</button>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-[#042C53]">Admin Dashboard</h1>
            <p className="text-[#185FA5] mt-1 font-medium">Manage all AquaChamp system administrators</p>
          </div>
          <button
            onClick={openModal}
            className="bg-[#185FA5] hover:bg-[#042C53] text-white font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 shadow-lg"
          >
            <span className="text-xl">+</span> Create Admin
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {STAT_ROLES.map((stat) => {
            const count = admins.filter((a) => a.roles?.includes(stat.role)).length;
            return (
              <div
                key={stat.role}
                onClick={() => setFilterRole(stat.role === filterRole ? "ALL" : stat.role)}
                className="bg-white rounded-2xl p-5 shadow-sm border border-[#E6F1FB] hover:shadow-md transition-all cursor-pointer"
                style={{ borderLeft: filterRole === stat.role ? `4px solid ${stat.color}` : "4px solid transparent" }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{stat.icon}</span>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: stat.color }}>{count}</div>
                </div>
                <div className="text-2xl font-extrabold text-[#042C53]">{count}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{stat.label}</div>
                <div className="mt-3 h-1 rounded-full opacity-30" style={{ backgroundColor: stat.color }}></div>
              </div>
            );
          })}
        </div>

        {/* Total Banner */}
        <div className="rounded-2xl p-6 mb-8 flex items-center justify-between shadow-lg"
          style={{ background: "linear-gradient(135deg, #042C53 0%, #185FA5 100%)" }}>
          <div>
            <p className="text-[#E6F1FB] text-sm font-medium mb-1">Total Administrators in System</p>
            <p className="text-white text-5xl font-extrabold">{admins.length}</p>
          </div>
          <div className="text-right">
            <p className="text-[#E6F1FB] text-sm opacity-70">Active</p>
            <p className="text-3xl font-bold" style={{ color: "#02C39A" }}>{admins.filter(a => a.active).length}</p>
          </div>
          <span className="text-8xl opacity-10 select-none">👥</span>
        </div>

        {/* Admins Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E6F1FB] overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E6F1FB] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[#042C53]">
              All Administrators
              {filterRole !== "ALL" && (
                <span className="ml-2 text-sm font-normal text-[#185FA5]">
                  — {filterRole}
                  <button onClick={() => setFilterRole("ALL")} className="ml-1 text-red-400 hover:text-red-600">✕</button>
                </span>
              )}
            </h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
                <input
                  type="text"
                  placeholder="Search admins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-[#E6F1FB] rounded-xl text-sm focus:outline-none focus:border-[#185FA5] w-48"
                />
              </div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="border border-[#E6F1FB] rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#185FA5] bg-white text-[#042C53]"
              >
                <option value="ALL">All Roles</option>
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="Game_ADMIN">Game Admin</option>
                <option value="Progress_ADMIN">Progress Admin</option>
                <option value="Activity_ADMIN">Activity Admin</option>
                <option value="Lesson_ADMIN">Lesson Admin</option>
              </select>
              <button onClick={fetchAdmins} className="text-[#185FA5] text-sm hover:underline font-medium">🔄 Refresh</button>
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-3 animate-bounce">🌊</div>
              <p className="text-[#185FA5] font-medium">Loading admins...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-red-500 font-medium">{error}</p>
              <p className="text-gray-400 text-sm mt-1">Make sure your backend is running</p>
            </div>
          ) : filteredAdmins.length === 0 ? (
            <div className="py-20 text-center">
              <div className="text-4xl mb-3">👤</div>
              <p className="text-gray-400 font-medium">No admins found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#E6F1FB]">
                  <tr>
                    {["#", "Admin", "Username", "Email", "Role", "Status"].map((h) => (
                      <th key={h} className="text-left px-6 py-3 text-xs font-bold text-[#042C53] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E6F1FB]">
                  {filteredAdmins.map((admin, index) => {
                    const roleConfig = getRoleConfig(admin.roles);
                    return (
                      <tr key={admin._id} className="hover:bg-[#E6F1FB] transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: roleConfig.bg }}>
                              {admin.firstName?.[0]}{admin.lastName?.[0]}
                            </div>
                            <div>
                              <p className="font-bold text-[#042C53] text-sm">{admin.firstName} {admin.lastName}</p>
                              <p className="text-xs text-gray-400">Age: {admin.age}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-medium">@{admin.username}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{admin.email}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1.5 rounded-full text-xs font-bold text-white inline-flex items-center gap-1"
                            style={{ backgroundColor: roleConfig.bg }}>
                            {roleConfig.icon} {roleConfig.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleStatus(admin._id, admin.active)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer border-none transition-all hover:opacity-80 ${
                              admin.active ? "bg-[#E1F5EE] text-[#1D9E75]" : "bg-red-100 text-red-500"
                            }`}
                          >
                            {admin.active ? "● Active" : "● Inactive"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && (
            <div className="px-6 py-3 border-t border-[#E6F1FB] bg-[#E6F1FB] bg-opacity-50">
              <p className="text-xs text-gray-400">
                Showing <span className="font-bold text-[#042C53]">{filteredAdmins.length}</span> of <span className="font-bold text-[#042C53]">{admins.length}</span> administrators
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Create Admin Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#042C53]">Create New Admin</h2>
                <p className="text-sm text-gray-400 mt-0.5">Fill in the details below</p>
              </div>
              <button onClick={() => setShowModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 text-xl font-bold">×</button>
            </div>

            {formError && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                ⚠️ {formError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">

              {/* First Name */}
              <div>
                <label className="block text-xs font-bold text-[#042C53] mb-1.5 uppercase tracking-wide">First Name</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  className={inputClass("firstName")} placeholder="Enter first name" />
                {fieldErrors.firstName && <p className="mt-1 text-xs text-red-500 font-medium">⚠ {fieldErrors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-bold text-[#042C53] mb-1.5 uppercase tracking-wide">Last Name</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  className={inputClass("lastName")} placeholder="Enter last name" />
                {fieldErrors.lastName && <p className="mt-1 text-xs text-red-500 font-medium">⚠ {fieldErrors.lastName}</p>}
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-bold text-[#042C53] mb-1.5 uppercase tracking-wide">Age <span className="text-gray-400 normal-case font-normal">(18–65)</span></label>
                <input type="number" name="age" value={form.age} onChange={handleChange}
                  className={inputClass("age")} placeholder="Enter age" min="18" max="65" />
                {fieldErrors.age && <p className="mt-1 text-xs text-red-500 font-medium">⚠ {fieldErrors.age}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#042C53] mb-1.5 uppercase tracking-wide">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  className={inputClass("email")} placeholder="name@example.com" autoComplete="off" />
                {fieldErrors.email && <p className="mt-1 text-xs text-red-500 font-medium">⚠ {fieldErrors.email}</p>}
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-bold text-[#042C53] mb-1.5 uppercase tracking-wide">Username</label>
                <input type="text" name="username" value={form.username} onChange={handleChange}
                  className={inputClass("username")} placeholder="e.g. john_admin" autoComplete="off" />
                {fieldErrors.username && <p className="mt-1 text-xs text-red-500 font-medium">⚠ {fieldErrors.username}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-[#042C53] mb-1.5 uppercase tracking-wide">Password <span className="text-gray-400 normal-case font-normal">(min 8)</span></label>
                <input type="password" name="password" value={form.password} onChange={handleChange}
                  className={inputClass("password")} placeholder="Min 8 characters" autoComplete="new-password" />
                {fieldErrors.password && <p className="mt-1 text-xs text-red-500 font-medium">⚠ {fieldErrors.password}</p>}
              </div>

              {/* Role — dropdown instead of text input */}
              <div className="col-span-2">
                <label className="block text-xs font-bold text-[#042C53] mb-1.5 uppercase tracking-wide">Role</label>
                <select name="roles" value={form.roles} onChange={handleChange}
                  className={`${inputClass("roles")} bg-white`}>
                  <option value="">— Select a role —</option>
                  <option value="Game_ADMIN">🎮 Game Admin</option>
                  <option value="Progress_ADMIN">🏆 Progress Admin</option>
                  <option value="Activity_ADMIN">💧 Activity Admin</option>
                  <option value="Lesson_ADMIN">📚 Lesson Admin</option>
                </select>
                {fieldErrors.roles && <p className="mt-1 text-xs text-red-500 font-medium">⚠ {fieldErrors.roles}</p>}
              </div>

            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)}
                className="flex-1 border-2 border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                className="flex-1 bg-[#185FA5] hover:bg-[#042C53] text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg">
                {submitting ? "Creating..." : "Create Admin ✓"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}