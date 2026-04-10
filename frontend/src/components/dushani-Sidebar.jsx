export default function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    { section: 'Overview', items: [{ id: 'overview', label: 'Dashboard' }] },
    { section: 'Management', items: [{ id: 'badges', label: 'Badges' }, { id: 'levels', label: 'Levels' }] },
    { section: 'Students', items: [{ id: 'leaderboard', label: 'Leaderboard', external: true }, { id: 'progress', label: 'Student Progress' }] },
  ];

  const handleNavigation = (item) => {
    if (item.external) {
      // Open leaderboard in new page without sidebar
      window.location.href = '/leaderboard';
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div className="w-[220px] flex-shrink-0 bg-[#042C53] flex flex-col py-5">
      <div className="px-5 pb-6 border-b border-white/10">
        <span className="text-[15px] font-medium text-white block">Progress Admin</span>
        <small className="text-[11px] text-white/50 mt-0.5 block">Gamification Panel</small>
      </div>

      {navItems.map(({ section, items }) => (
        <div key={section}>
          <div className="px-3 pt-4 pb-1 text-[10px] font-medium text-white/40 uppercase tracking-widest">
            {section}
          </div>
          {items.map(({ id, label, external }) => (
            <button
              key={id}
              onClick={() => handleNavigation({ id, external })}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 mx-2 rounded-md text-[13px] transition-colors text-left cursor-pointer border-0
                ${activePage === id
                  ? 'bg-[#185FA5] text-white'
                  : 'text-white/65 hover:bg-white/8 hover:text-white'
                }`}
              style={{ width: 'calc(100% - 16px)' }}
            >
              <span className={`w-[7px] h-[7px] rounded-full flex-shrink-0 ${activePage === id ? 'bg-[#E6F1FB]' : 'bg-white/30'}`} />
              {label}
              {external && <span className="ml-auto text-[10px] opacity-50">↗</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
