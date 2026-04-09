import { useState, useEffect } from 'react';

const EMPTY_LEVEL = { name: '', min: '', max: '', desc: '' };

export default function LevelsPage() {
  const [levels, setLevels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_LEVEL);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch('http://localhost:4000/api/levels/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      if (data.success) {
        setLevels(data.levels || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  function openForm(id) {
    if (id) {
      const l = levels.find(x => x._id === id);
      setForm({ 
        name: l.levelName, 
        min: l.minPoints, 
        max: l.maxPoints === null ? '' : l.maxPoints, 
        desc: l.description || '' 
      });
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
        description: form.desc
      };

      const url = editingId 
        ? `http://localhost:4000/api/levels/${editingId}`
        : 'http://localhost:4000/api/levels/';
      
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(levelData)
      });

      const data = await res.json();
      if (data.success) {
        setShowForm(false);
        setSaved(true);
        await fetchLevels();
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert(data.message || 'Failed to save level');
      }
    } catch (error) {
      console.error('Error saving level:', error);
      alert('Failed to save level');
    }
  }

  async function deleteLevel(id, levelName) {
    if (!confirm(`Are you sure you want to delete "${levelName}"? This will recalculate all student levels.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token') || localStorage.getItem('superAdminToken');
      const res = await fetch(`http://localhost:4000/api/levels/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      if (data.success) {
        setSaved(true);
        await fetchLevels();
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert(data.message || 'Failed to delete level');
      }
    } catch (error) {
      console.error('Error deleting level:', error);
      alert('Failed to delete level');
    }
  }

  const totalStudents = levels.reduce((sum, l) => sum + (l.studentCount || 0), 0);

  if (loading) {
    return (
      <div>
        <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
          <h1 className="text-base font-medium text-gray-900">Level management</h1>
        </div>
        <div className="p-6">
          <div className="text-center text-gray-500">Loading levels...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between">
        <h1 className="text-base font-medium text-gray-900">Level management</h1>
        <button onClick={() => openForm(null)} className="px-3.5 py-1.5 bg-[#185FA5] text-white text-[13px] rounded-md hover:bg-[#0C447C] transition-colors cursor-pointer border-0">
          + Create level
        </button>
      </div>

      <div className="p-6">
        {/* Form */}
        {showForm && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-5">
            <div className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-sm font-medium text-gray-900">{editingId ? 'Edit level' : 'Create new level'}</h2>
              <button onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-gray-200 rounded-md text-[13px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancel</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Level name</label>
                    <input className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                      placeholder="e.g. Level 3" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Min points</label>
                    <input type="number" className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                      placeholder="0" value={form.min} onChange={e => setForm(f => ({ ...f, min: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Max points (blank = unlimited)</label>
                    <input type="number" className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                      placeholder="leave blank for unlimited" value={form.max} onChange={e => setForm(f => ({ ...f, max: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Description</label>
                    <input className="w-full px-2.5 py-2 border border-gray-200 rounded-md text-[13px] text-gray-900 focus:outline-none focus:border-[#185FA5]"
                      placeholder="Optional description" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-4">
                <button onClick={() => setShowForm(false)} className="px-3.5 py-1.5 border border-gray-200 rounded-md text-[13px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Cancel</button>
                <button onClick={saveLevel} className="px-3.5 py-1.5 bg-[#185FA5] text-white text-[13px] rounded-md hover:bg-[#0C447C] transition-colors cursor-pointer border-0">Save level</button>
              </div>
            </div>
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#E1F5EE] text-[#0F6E56] rounded-md text-[13px] mb-4">
            ✓ Level saved successfully. All student levels have been recalculated.
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr>
                {['Level', 'Points range', 'Students', 'Distribution', ''].map(h => (
                  <th key={h} className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-3 py-2 border-b border-gray-100">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {levels.map(l => (
                <tr key={l._id} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2.5 font-medium text-gray-800">{l.levelName}</td>
                  <td className="px-3 py-2.5 text-gray-400">{l.minPoints} – {l.maxPoints === null ? '∞' : l.maxPoints} pts</td>
                  <td className="px-3 py-2.5 font-medium text-[#185FA5]">{l.studentCount || 0}</td>
                  <td className="px-3 py-2.5 w-40">
                    <div className="h-1.5 bg-gray-100 rounded-full">
                      <div className="h-1.5 rounded-full bg-[#185FA5]" style={{ width: `${totalStudents > 0 ? Math.round(((l.studentCount || 0) / totalStudents) * 100) : 0}%` }} />
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button onClick={() => openForm(l._id)} className="px-2.5 py-1 border border-gray-200 rounded text-[12px] text-gray-600 hover:bg-gray-50 cursor-pointer bg-white">Edit</button>
                      <button onClick={() => deleteLevel(l._id, l.levelName)} className="px-2.5 py-1 border border-red-200 rounded text-[12px] text-red-600 hover:bg-red-50 cursor-pointer bg-white">Delete</button>
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
