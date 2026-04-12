import { useState, useEffect } from 'react';

const EMPTY_LEVEL = { name: '', min: '', max: '', desc: '' };

const levelColorSchemes = [
  { bar: '#185FA5', bg: '#E6F1FB', color: '#185FA5', border: '#93c5fd', icon: '🥇' },
  { bar: '#0ea5e9', bg: '#e0f2fe', color: '#0369a1', border: '#7dd3fc', icon: '🥈' },
  { bar: '#0F6E56', bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7', icon: '🥉' },
  { bar: '#EF9F27', bg: '#faeeda', color: '#854d0e', border: '#fcd34d', icon: '🏊' },
  { bar: '#0284c7', bg: '#f0f9ff', color: '#075985', border: '#bae6fd', icon: '🌊' },
  { bar: '#64748b', bg: '#f1f5f9', color: '#334155', border: '#cbd5e1', icon: '⭐' },
];

const inputStyle = {
  background: '#f8faff',
  border: '1px solid #bfdbfe',
  color: '#0b2540',
  borderRadius: '12px',
  padding: '10px 14px',
  fontSize: '13px',
  width: '100%',
  outline: 'none',
  fontFamily: "'Segoe UI', sans-serif",
};

const labelStyle = {
  display: 'block',
  fontSize: '10px',
  fontWeight: '700',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#185FA5',
  marginBottom: '6px',
};

export default function DushaniLevelsPage() {
  const [levels, setLevels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_LEVEL);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLevels(); }, []);

  const fetchLevels = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/levels/`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) setLevels(data.levels || []);
    } catch (e) {
      console.error('Error fetching levels:', e);
    } finally {
      setLoading(false);
    }
  };

  function openForm(id) {
    if (id) {
      const l = levels.find((x) => x._id === id);
      setForm({ name: l.levelName, min: l.minPoints, max: l.maxPoints === null ? '' : l.maxPoints, desc: l.description || '' });
      setEditingId(id);
    } else {
      setForm(EMPTY_LEVEL);
      setEditingId(null);
    }
    setShowForm(true);
  }

  async function saveLevel() {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const levelData = {
        levelName: form.name,
        minPoints: Number(form.min),
        maxPoints: form.max === '' ? null : Number(form.max),
        description: form.desc,
      };
      const res = await fetch(
        editingId ? `${import.meta.env.VITE_API_URL}/api/levels/${editingId}` : `${import.meta.env.VITE_API_URL}/api/levels/`,
        { method: editingId ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(levelData) }
      );
      const data = await res.json();
      if (data.success) {
        setShowForm(false); setSaved(true);
        await fetchLevels();
        setTimeout(() => setSaved(false), 2500);
      } else { alert(data.message || 'Failed to save level'); }
    } catch (e) { console.error('Error saving level:', e); alert('Failed to save level'); }
  }

  async function deleteLevel(id, levelName) {
    if (!confirm(`Are you sure you want to delete "${levelName}"? This will recalculate all student levels.`)) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/levels/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) { setSaved(true); await fetchLevels(); setTimeout(() => setSaved(false), 2500); }
      else alert(data.message || 'Failed to delete level');
    } catch (e) { console.error('Error deleting level:', e); alert('Failed to delete level'); }
  }

  const totalStudents = levels.reduce((sum, l) => sum + (l.studentCount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: '#f0f4f8' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #185FA5)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
            🌊
          </div>
          <p className="text-sm font-semibold tracking-wide" style={{ color: '#185FA5' }}>Loading levels…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#f0f4f8', minHeight: '100%', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* Page Header */}
      <div className="flex items-center justify-between px-8 py-4"
        style={{ background: 'linear-gradient(90deg, #ffffff 0%, #e6f1fb 100%)', borderBottom: '1px solid #bfdbfe', boxShadow: '0 2px 12px rgba(24,95,165,0.08)' }}>
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0b2540' }}>🏊 Level Management</h1>
          <p className="text-xs mt-0.5 font-medium tracking-wide" style={{ color: '#185FA5' }}>AquaChamp · Gamification</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl"
            style={{ background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd' }}>
            {levels.length} level{levels.length !== 1 ? 's' : ''}
          </span>
          <button onClick={() => openForm(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #185FA5, #0ea5e9)', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(14,165,233,0.4)', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(14,165,233,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
            + Create Level
          </button>
        </div>
      </div>

      <div className="p-6 space-y-5">

        {/* Success Toast */}
        {saved && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46' }}>
            <span className="text-lg">✅</span> Level saved. All student levels have been recalculated.
          </div>
        )}

        {/* Create / Edit Form */}
        {showForm && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: '#ffffff', border: '1px solid #bfdbfe', boxShadow: '0 4px 20px rgba(24,95,165,0.1)' }}>

            {/* Form Header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)', borderBottom: '1px solid #bfdbfe' }}>
              <h2 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#185FA5' }}>
                {editingId ? '✏️ Edit Level' : '➕ Create New Level'}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: '#f0f4f8', border: '1px solid #bfdbfe', color: '#64748b', cursor: 'pointer' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f4f8'; }}>
                Cancel
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {/* Left */}
                <div className="space-y-4">
                  <div>
                    <label style={labelStyle}>Level Name</label>
                    <input style={inputStyle} placeholder="e.g. Level 3"
                      value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Min Points</label>
                    <input type="number" style={inputStyle} placeholder="0"
                      value={form.min} onChange={(e) => setForm((f) => ({ ...f, min: e.target.value }))}
                      onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>
                {/* Right */}
                <div className="space-y-4">
                  <div>
                    <label style={labelStyle}>Max Points <span style={{ color: '#94a3b8', textTransform: 'none', fontSize: '10px' }}>(blank = unlimited)</span></label>
                    <input type="number" style={inputStyle} placeholder="leave blank for unlimited"
                      value={form.max} onChange={(e) => setForm((f) => ({ ...f, max: e.target.value }))}
                      onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Description <span style={{ color: '#94a3b8', textTransform: 'none', fontSize: '10px' }}>(optional)</span></label>
                    <input style={inputStyle} placeholder="e.g. Intermediate swimmer"
                      value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                      onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: '#f0f4f8', border: '1px solid #bfdbfe', color: '#64748b', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f0f4f8'; }}>
                  Cancel
                </button>
                <button onClick={saveLevel}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #185FA5, #0ea5e9)', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(14,165,233,0.4)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(14,165,233,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  💾 Save Level
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Levels Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid #bfdbfe', boxShadow: '0 4px 16px rgba(24,95,165,0.08)' }}>

          {/* Table Header */}
          <div className="grid text-[10px] font-bold uppercase tracking-widest px-5 py-3"
            style={{ background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)', color: '#185FA5', borderBottom: '1px solid #bfdbfe', gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr 120px' }}>
            <span>Level</span>
            <span>Points Range</span>
            <span>Students</span>
            <span>Distribution</span>
            <span></span>
          </div>

          {/* Rows */}
          {levels.length === 0 ? (
            <div className="text-center py-14" style={{ color: '#94a3b8' }}>
              <div className="text-4xl mb-2">🏊</div>
              <p className="text-sm font-semibold">No levels configured yet</p>
              <p className="text-xs mt-1">Create your first level to get started</p>
            </div>
          ) : (
            levels.map((l, idx) => {
              const scheme = levelColorSchemes[idx % levelColorSchemes.length];
              const pct = totalStudents > 0 ? Math.round(((l.studentCount || 0) / totalStudents) * 100) : 0;
              return (
                <div key={l._id}
                  className="grid items-center px-5 py-4 transition-all"
                  style={{ gridTemplateColumns: '1.5fr 1.5fr 1fr 2fr 120px', borderBottom: idx < levels.length - 1 ? '1px solid #e0eeff' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f7f9ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>

                  {/* Level Name */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: scheme.bg, border: `1px solid ${scheme.border}` }}>
                      {scheme.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#0b2540' }}>{l.levelName}</div>
                      {l.description && (
                        <div className="text-[11px] mt-0.5" style={{ color: '#94a3b8' }}>{l.description}</div>
                      )}
                    </div>
                  </div>

                  {/* Points Range */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: scheme.bg, color: scheme.color, border: `1px solid ${scheme.border}` }}>
                      {l.minPoints.toLocaleString()}
                    </span>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>→</span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg"
                      style={{ background: scheme.bg, color: scheme.color, border: `1px solid ${scheme.border}` }}>
                      {l.maxPoints === null ? '∞' : l.maxPoints.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-medium" style={{ color: '#94a3b8' }}>pts</span>
                  </div>

                  {/* Student Count */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold" style={{ color: scheme.color }}>
                      {l.studentCount || 0}
                    </span>
                    <span className="text-xs" style={{ color: '#94a3b8' }}>students</span>
                  </div>

                  {/* Distribution Bar */}
                  <div className="pr-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold" style={{ color: '#94a3b8' }}>{pct}%</span>
                    </div>
                    <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#f0f4f8' }}>
                      <div className="h-2.5 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${scheme.bar}, ${scheme.bar}cc)`, boxShadow: `0 0 8px ${scheme.bar}55` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openForm(l._id)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#bfdbfe'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#E6F1FB'; }}>
                      Edit
                    </button>
                    <button onClick={() => deleteLevel(l._id, l.levelName)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#fef2f2'; }}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
