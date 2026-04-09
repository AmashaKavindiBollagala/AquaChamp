import { useState, useEffect } from 'react';

const EMPTY_BADGE = { name: '', type: 'Milestone', points: '', section: '', icon: '', status: 'Active', desc: '' };

const pillClass = {
  Milestone: 'bg-[#E6F1FB] text-[#185FA5]',
  'Section Completion': 'bg-[#E1F5EE] text-[#0F6E56]',
  Special: 'bg-[#FAEEDA] text-[#854F0B]',
};

export default function BadgesPage() {
  const [badges, setBadges] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_BADGE);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch('http://localhost:4000/api/badges/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setBadges(data.badges || []);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filters = ['all', 'Milestone', 'Section Completion', 'Special'];
  const filtered = filter === 'all' ? badges : badges.filter(b => b.badgeType === filter);

  function openForm(id) {
    if (id) {
      const b = badges.find(x => x._id === id);
      setForm({ 
        name: b.badgeName, 
        type: b.badgeType, 
        points: b.pointsRequired || '', 
        section: b.sectionName || '', 
        icon: b.badgeIcon, 
        status: b.status, 
        desc: b.description || '' 
      });
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
        badgeName: form.name,
        badgeType: form.type,
        pointsRequired: form.type === 'Milestone' ? Number(form.points) : 0,
        sectionName: form.type === 'Section Completion' ? form.section : null,
        badgeIcon: form.icon || '⭐',
        description: form.desc,
        status: form.status
      };

      const url = editingId 
        ? `http://localhost:4000/api/badges/${editingId}`
        : 'http://localhost:4000/api/badges/';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(badgeData)
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setSaved(true);
        await fetchBadges();
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert(data.message || 'Failed to save badge');
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Failed to save badge');
    }
  }

  async function deleteBadge(id) {
    if (!confirm('Are you sure you want to delete this badge?')) return;

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch(`http://localhost:4000/api/badges/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) {
        await fetchBadges();
      } else {
        alert(data.message || 'Failed to delete badge');
      }
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Failed to delete badge');
    }
  }

  if (loading) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
          <h1 className="text-base font-medium text-gray-900">Badge management</h1>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">Loading badges...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <h1 className="text-base font-medium text-gray-900">Badge management</h1>
        <button onClick={() => openForm(null)} className="px-3.5 py-1.5 bg-[#185FA5] text-white text-[13px] rounded-md hover:bg-[#0C447C] transition-colors cursor-pointer border-0">
          + Create badge
        </button>
      </div>

      <div className="p-6">
        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
            <div className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">{editingId ? 'Edit badge' : 'Create new badge'}</h2>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-gray-200 rounded-md text-[13px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancel</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3.5">
                  {[
                    { label: 'Badge name', field: 'name', placeholder: 'e.g. First 100 Points' },
                  ].map(({ label, field, placeholder }) => (
                    <div key={field}>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
                      <input className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                        placeholder={placeholder} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Badge type</label>
                    <select className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5] bg-white cursor-pointer"
                      value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                      {['Milestone', 'Section Completion', 'Special'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  {form.type === 'Milestone' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Points required</label>
                      <input type="number" className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                        placeholder="e.g. 100" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))} />
                    </div>
                  )}
                  {form.type === 'Section Completion' && (
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Section name</label>
                      <input className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                        placeholder="e.g. Ocean Basics" value={form.section} onChange={e => setForm(f => ({ ...f, section: e.target.value }))} />
                    </div>
                  )}
                </div>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Badge icon (emoji)</label>
                    <input className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                      placeholder="⭐" maxLength={4} value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
                    <select className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5] bg-white cursor-pointer"
                      value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option>Active</option><option>Inactive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                    <textarea rows={3} className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5] resize-none"
                      placeholder="What does this badge reward?" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowForm(false)} className="px-3.5 py-1.5 border border-gray-200 rounded-md text-[13px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancel</button>
                <button onClick={saveBadge} className="px-3.5 py-1.5 bg-[#185FA5] text-white text-[13px] rounded-md hover:bg-[#0C447C] transition-colors cursor-pointer border-0">Save badge</button>
              </div>
            </div>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#E1F5EE] text-[#0F6E56] rounded-md text-[13px] mb-4">
            ✓ Badge saved successfully.
          </div>
        )}

        {/* Filter chips */}
        <div className="flex gap-1.5 flex-wrap mb-4">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs cursor-pointer border transition-colors
                ${filter === f ? 'bg-[#E6F1FB] text-[#185FA5] border-[#B5D4F4]' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}>
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {['Badge', 'Type', 'Requirement', 'Status', 'Earned by', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <span className="text-base">{b.badgeIcon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{b.badgeName}</div>
                        <div className="text-[11px] text-gray-400">{b.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${pillClass[b.badgeType]}`}>{b.badgeType}</span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-400">
                    {b.badgeType === 'Milestone' ? `${b.pointsRequired} pts` : b.badgeType === 'Section Completion' ? b.sectionName : '—'}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${b.status === 'Active' ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-gray-100 text-gray-400'}`}>{b.status}</span>
                  </td>
                  <td className="px-3 py-2.5 font-medium text-[#EF9F27]">{b.earnedCount || 0}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-1.5">
                      <button onClick={() => openForm(b._id)} className="px-2.5 py-1 border border-gray-200 rounded text-[12px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Edit</button>
                      <button onClick={() => deleteBadge(b._id)} className="px-2.5 py-1 border border-red-200 rounded text-[12px] text-red-400 hover:bg-red-50 cursor-pointer bg-white">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
