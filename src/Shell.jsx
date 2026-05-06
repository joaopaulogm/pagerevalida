/* global React, Icon, Streak */
const { useState: useStateShell } = React;

const SHELL_NAV = [
  { id: 'dashboard', label: 'Dashboard',        icon: 'dashboard' },
  { id: 'provas',    label: 'Provas INEP',       icon: 'list',     badge: 'Novo' },
  { id: 'xray',      label: 'Banco de questões', icon: 'scan',     badge: 'Raio-X' },
  { id: 'acervo',    label: 'Acervo',            icon: 'book' },
  { id: 'lab',       label: 'Laboratório de IA', icon: 'sparkles' },
];

const Shell = ({ current, onNavigate, children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)' }}>
      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)', background: 'var(--navy-900)', color: '#fff',
        padding: '18px 12px', display: 'flex', flexDirection: 'column', gap: 2,
        position: 'sticky', top: 0, height: '100vh', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: 12 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--teal-500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
              <circle cx="12" cy="14" r="4"/><path d="M8 4v4a4 4 0 0 0 8 0V4"/>
            </svg>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 17, letterSpacing: '-0.01em' }}>
            Page <span style={{ color: 'var(--teal-300)' }}>Revalida</span>
          </div>
        </div>

        {SHELL_NAV.map(item => {
          const active = current === item.id;
          return (
            <div key={item.id} onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
                borderRadius: 8, fontSize: 13.5, fontFamily: 'var(--font-sans)',
                color: active ? '#fff' : 'rgba(255,255,255,0.72)',
                background: active ? 'rgba(20,165,171,0.18)' : 'transparent',
                cursor: 'pointer', transition: 'background 120ms',
              }}
              onMouseOver={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10,
                  background: 'var(--teal-500)', color: '#fff', padding: '2px 7px', borderRadius: 9999 }}>
                  {item.badge}
                </span>
              )}
            </div>
          );
        })}

        <div style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.08em', textTransform: 'uppercase', padding: '16px 10px 6px' }}>Revisão</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
          borderRadius: 8, fontSize: 13.5, color: 'rgba(255,255,255,0.72)', cursor: 'pointer' }}>
          <Icon name="refresh" size={16} />
          <span>Revisão espaçada</span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10,
            background: 'var(--teal-500)', color: '#fff', padding: '2px 7px', borderRadius: 9999 }}>12</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 10px',
          borderRadius: 8, fontSize: 13.5, color: 'rgba(255,255,255,0.72)', cursor: 'pointer' }}>
          <Icon name="settings" size={16} />
          <span>Ajustes</span>
        </div>

        <div style={{ marginTop: 'auto', padding: 10, background: 'rgba(255,255,255,0.04)',
          borderRadius: 10, fontFamily: 'var(--font-sans)', fontSize: 12, color: 'rgba(255,255,255,0.75)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 9999, background: 'var(--navy-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 12 }}>MR</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 500 }}>Marina R.</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.55)' }}>Plano Premium</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Topbar + main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <header style={{
          height: 'var(--topbar-h)', background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-1)', display: 'flex', alignItems: 'center',
          gap: 16, padding: '0 24px', position: 'sticky', top: 0, zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1,
            background: 'var(--slate-100)', padding: '8px 12px', borderRadius: 10, maxWidth: 360,
            color: 'var(--fg-3)' }}>
            <Icon name="search" size={16} />
            <span style={{ fontSize: 13 }}>Buscar questões, diretrizes, tópicos…</span>
            <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10.5,
              color: 'var(--fg-4)', background: '#fff', border: '1px solid var(--border-1)',
              borderRadius: 4, padding: '1px 5px' }}>⌘K</span>
          </div>
          <div style={{ flex: 1 }} />
          <Streak days={12} />
          <button style={{ border: 'none', background: 'transparent', color: 'var(--fg-2)', cursor: 'pointer',
            padding: 8, borderRadius: 9999, display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Icon name="bell" size={18} />
            <span style={{ position: 'absolute', top: 6, right: 6, width: 7, height: 7, borderRadius: 9999,
              background: 'var(--danger-500)' }}/>
          </button>
          <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'var(--navy-800)',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-sans)', fontWeight: 600, fontSize: 12.5 }}>MR</div>
        </header>
        <main style={{ padding: 28, flex: 1, minWidth: 0 }}>{children}</main>
      </div>
    </div>
  );
};

window.Shell = Shell;
