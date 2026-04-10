export default function Sidebar({ activePage, onNavigate }) {
  const navItems = [
    {
      section: 'Overview',
      items: [{ id: 'overview', label: 'Dashboard', icon: '⚡' }],
    },
    {
      section: 'Management',
      items: [
        { id: 'badges', label: 'Badges', icon: '🏅' },
        { id: 'levels', label: 'Levels', icon: '🏊' },
      ],
    },
    {
      section: 'Students',
      items: [
        { id: 'leaderboard', label: 'Leaderboard', icon: '🏆', external: true },
        { id: 'progress', label: 'Student Progress', icon: '🎓' },
      ],
    },
  ];

  const handleNavigation = (item) => {
    if (item.external) {
      window.location.href = '/leaderboard';
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div
      className="w-64 flex-shrink-0 flex flex-col"
      style={{
        background: 'linear-gradient(170deg, #0b2540 0%, #0d3b6e 55%, #0b2540 100%)',
        borderRight: '1px solid rgba(24,95,165,0.3)',
        boxShadow: '4px 0 28px rgba(11,37,64,0.5)',
        fontFamily: "'Segoe UI', sans-serif",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-3 px-5 py-6"
        style={{ borderBottom: '1px solid rgba(24,95,165,0.3)' }}
      >
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
          style={{
            background: 'linear-gradient(135deg, #0ea5e9, #185FA5)',
            boxShadow: '0 0 20px rgba(14,165,233,0.5)',
          }}
        >
          🌊
        </div>
        <div>
          <div className="text-base font-bold tracking-wide text-white leading-tight">
            AquaChamp
          </div>
          <div
            className="text-[10px] tracking-widest uppercase font-semibold"
            style={{ color: '#7EC8F0' }}
          >
            Progress Admin
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-5 px-3 space-y-5">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            {/* Section label */}
            <div
              className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: 'rgba(126,200,240,0.45)' }}
            >
              {section}
            </div>

            <div className="space-y-1">
              {items.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative text-left"
                    style={
                      isActive
                        ? {
                            background: 'linear-gradient(135deg, #185FA5, #0ea5e9)',
                            color: '#ffffff',
                            boxShadow: '0 4px 18px rgba(14,165,233,0.45)',
                            border: '1px solid rgba(126,200,240,0.35)',
                          }
                        : {
                            color: '#7EC8F0',
                            border: '1px solid transparent',
                            background: 'transparent',
                          }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(14,165,233,0.12)';
                        e.currentTarget.style.color = '#bae6fd';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#7EC8F0';
                      }
                    }}
                  >
                    {/* Active left bar */}
                    {isActive && (
                      <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 rounded-r-full"
                        style={{ height: '60%', background: '#7EC8F0' }}
                      />
                    )}

                    <span className="text-base shrink-0">{item.icon}</span>
                    <span className="text-sm font-semibold tracking-wide flex-1">
                      {item.label}
                    </span>

                    {isActive && (
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ background: '#bae6fd', boxShadow: '0 0 6px #bae6fd' }}
                      />
                    )}

                    {item.external && !isActive && (
                      <span
                        className="text-[11px] font-bold shrink-0"
                        style={{ color: 'rgba(126,200,240,0.5)' }}
                      >
                        ↗
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-3 pb-4"
        style={{ borderTop: '1px solid rgba(24,95,165,0.3)' }}
      >
        <div className="flex items-center gap-2.5 px-3 pt-4">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9, #185FA5)',
              boxShadow: '0 0 12px rgba(14,165,233,0.4)',
            }}
          >
            A
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">Dushani</div>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{
                background: 'rgba(14,165,233,0.2)',
                color: '#7EC8F0',
                border: '1px solid rgba(14,165,233,0.3)',
              }}
            >
              Progress Admin
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
