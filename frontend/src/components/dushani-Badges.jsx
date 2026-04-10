import { useState, useEffect } from 'react';

const EMPTY_BADGE = { name: '', type: 'Milestone', points: '', section: '', icon: '', status: 'Active', desc: '' };

const typeSchemes = {
  Milestone:          { bg: '#E6F1FB', color: '#185FA5', border: '#93c5fd' },
  'Section Completion': { bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
  Special:            { bg: '#faeeda', color: '#854d0e', border: '#fcd34d' },
};

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

export default function DushaniBadgesPage() {
  const [badges, setBadges] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_BADGE);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchBadges(); }, []);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch('http://localhost:4000/api/badges/', {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) setBadges(data.badges || []);
    } catch (e) {
      console.error('Error fetching badges:', e);
    } finally {
      setLoading(false);
    }
  };

  const filters = ['all', 'Milestone', 'Section Completion', 'Special'];
  const filtered = filter === 'all' ? badges : badges.filter((b) => b.badgeType === filter);

  function openForm(id) {
    if (id) {
      const b = badges.find((x) => x._id === id);
      setForm({ name: b.badgeName, type: b.badgeType, points: b.pointsRequired || '', section: b.sectionName || '', icon: b.badgeIcon, status: b.status, desc: b.description || '' });
      setEditingId(id);
    } else {
      setForm(EMPTY_BADGE);
      setEditingId(null);
    }
    setShowForm(true);
  }

  async function saveBadge() {
    if (!form.name.trim()) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const badgeData = {
        badgeName: form.name, badgeType: form.type,
        pointsRequired: form.type === 'Milestone' ? Number(form.points) : 0,
        sectionName: form.type === 'Section Completion' ? form.section : null,
        badgeIcon: form.icon || '⭐', description: form.desc, status: form.status,
      };
      const res = await fetch(
        editingId ? `http://localhost:4000/api/badges/${editingId}` : 'http://localhost:4000/api/badges/',
        { method: editingId ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(badgeData) }
      );
      const data = await res.json();
      if (data.success) {
        setShowForm(false); setSaved(true);
        await fetchBadges();
        setTimeout(() => setSaved(false), 2500);
      } else { alert(data.message || 'Failed to save badge'); }
    } catch (e) { console.error('Error saving badge:', e); alert('Failed to save badge'); }
  }

  async function deleteBadge(id) {
    if (!confirm('Are you sure you want to delete this badge?')) return;
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch(`http://localhost:4000/api/badges/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) await fetchBadges();
      else alert(data.message || 'Failed to delete badge');
    } catch (e) { console.error('Error deleting badge:', e); alert('Failed to delete badge'); }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: '#f0f4f8' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl animate-pulse"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #185FA5)', boxShadow: '0 0 20px rgba(14,165,233,0.4)' }}>
            🌊
          </div>
          <p className="text-sm font-semibold tracking-wide" style={{ color: '#185FA5' }}>Loading badges…</p>
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
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#0b2540' }}>🏅 Badge Management</h1>
          <p className="text-xs mt-0.5 font-medium tracking-wide" style={{ color: '#185FA5' }}>AquaChamp · Gamification</p>
        </div>
        <button
          onClick={() => openForm(null)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'linear-gradient(135deg, #185FA5, #0ea5e9)', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(14,165,233,0.4)', cursor: 'pointer' }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(14,165,233,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >
          + Create Badge
        </button>
      </div>

      <div className="p-6 space-y-5">

        {/* Success Toast */}
        {saved && (
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: '#ecfdf5', border: '1px solid #6ee7b7', color: '#065f46' }}>
            <span className="text-lg">✅</span> Badge saved successfully.
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
                {editingId ? '✏️ Edit Badge' : '➕ Create New Badge'}
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
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label style={labelStyle}>Badge Name</label>
                    <input style={inputStyle} placeholder="e.g. First 100 Points"
                      value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Badge Type</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }}
                      value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                      {['Milestone', 'Section Completion', 'Special'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {form.type === 'Milestone' && (
                    <div>
                      <label style={labelStyle}>Points Required</label>
                      <input type="number" style={inputStyle} placeholder="e.g. 100"
                        value={form.points} onChange={(e) => setForm((f) => ({ ...f, points: e.target.value }))}
                        onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                        onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                  )}
                  {form.type === 'Section Completion' && (
                    <div>
                      <label style={labelStyle}>Section Name</label>
                      <input style={inputStyle} placeholder="e.g. Ocean Basics"
                        value={form.section} onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
                        onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                        onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label style={labelStyle}>Badge Icon (Emoji)</label>
                    <input style={{ ...inputStyle, fontSize: '20px', textAlign: 'center' }} placeholder="⭐"
                      maxLength={4} value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                      onFocus={(e) => { e.target.style.border = '1px solid #0ea5e9'; e.target.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'; }}
                      onBlur={(e) => { e.target.style.border = '1px solid #bfdbfe'; e.target.style.boxShadow = 'none'; }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Status</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }}
                      value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea rows={3} style={{ ...inputStyle, resize: 'none' }}
                      placeholder="What does this badge reward?"
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
                <button onClick={saveBadge}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: 'linear-gradient(135deg, #185FA5, #0ea5e9)', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(14,165,233,0.4)', cursor: 'pointer' }}
                  onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 20px rgba(14,165,233,0.55)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(14,165,233,0.4)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  💾 Save Badge
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Chips */}
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => {
            const isActive = filter === f;
            const scheme = f === 'all' ? { bg: '#E6F1FB', color: '#185FA5', border: '#93c5fd' } : typeSchemes[f];
            return (
              <button key={f} onClick={() => setFilter(f)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={isActive
                  ? { background: scheme.bg, color: scheme.color, border: `1px solid ${scheme.border}`, cursor: 'pointer', boxShadow: `0 2px 8px ${scheme.border}66` }
                  : { background: '#ffffff', color: '#94a3b8', border: '1px solid #e2e8f0', cursor: 'pointer' }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#f8faff'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = '#ffffff'; }}>
                {f === 'all' ? 'All Badges' : f}
              </button>
            );
          })}
          <div className="ml-auto flex items-center">
            <span className="text-xs font-bold px-3 py-1.5 rounded-xl"
              style={{ background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd' }}>
              {filtered.length} badge{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: '#ffffff', border: '1px solid #bfdbfe', boxShadow: '0 4px 16px rgba(24,95,165,0.08)' }}>

          {/* Table Header */}
          <div className="grid text-[10px] font-bold uppercase tracking-widest px-5 py-3"
            style={{ background: 'linear-gradient(90deg, #e6f1fb, #f0f8ff)', color: '#185FA5', borderBottom: '1px solid #bfdbfe', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1fr 0.8fr 120px' }}>
            <span>Badge</span>
            <span>Type</span>
            <span>Requirement</span>
            <span>Status</span>
            <span>Earned</span>
            <span></span>
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div className="text-center py-14" style={{ color: '#94a3b8' }}>
              <div className="text-4xl mb-2">🏅</div>
              <p className="text-sm font-semibold">No badges found</p>
            </div>
          ) : (
            filtered.map((b, idx) => {
              const scheme = typeSchemes[b.badgeType] || typeSchemes.Special;
              return (
                <div key={b._id}
                  className="grid items-center px-5 py-4 transition-all"
                  style={{ gridTemplateColumns: '2.5fr 1.2fr 1.2fr 1fr 0.8fr 120px', borderBottom: idx < filtered.length - 1 ? '1px solid #e0eeff' : 'none' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f7f9ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>

                  {/* Badge info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ background: scheme.bg, border: `1px solid ${scheme.border}` }}>
                      {b.badgeIcon}
                    </div>
                    <div>
                      <div className="text-sm font-bold" style={{ color: '#0b2540' }}>{b.badgeName}</div>
                      {b.description && <div className="text-[11px] mt-0.5 truncate max-w-[200px]" style={{ color: '#94a3b8' }}>{b.description}</div>}
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold"
                      style={{ background: scheme.bg, color: scheme.color, border: `1px solid ${scheme.border}` }}>
                      {b.badgeType}
                    </span>
                  </div>

                  {/* Requirement */}
                  <div className="text-sm font-semibold" style={{ color: '#64748b' }}>
                    {b.badgeType === 'Milestone' ? `${b.pointsRequired} pts` : b.badgeType === 'Section Completion' ? b.sectionName : '—'}
                  </div>

                  {/* Status */}
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                      style={b.status === 'Active'
                        ? { background: '#ecfdf5', color: '#065f46', border: '1px solid #6ee7b7' }
                        : { background: '#f1f5f9', color: '#94a3b8', border: '1px solid #e2e8f0' }}>
                      <span className="w-1.5 h-1.5 rounded-full"
                        style={{ background: b.status === 'Active' ? '#22c55e' : '#cbd5e1', display: 'inline-block' }} />
                      {b.status}
                    </span>
                  </div>

                  {/* Earned count */}
                  <div className="text-sm font-bold" style={{ color: '#EF9F27' }}>
                    {b.earnedCount || 0}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button onClick={() => openForm(b._id)}
                      className="flex-1 py-1.5 rounded-xl text-xs font-bold transition-all"
                      style={{ background: '#E6F1FB', color: '#185FA5', border: '1px solid #93c5fd', cursor: 'pointer' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#bfdbfe'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#E6F1FB'; }}>
                      Edit
                    </button>
                    <button onClick={() => deleteBadge(b._id)}
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
