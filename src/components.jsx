/* global React */
const { useState } = React;

// ---------- Icon ----------
const I = {
  dashboard: <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>,
  list: <svg viewBox="0 0 24 24"><path d="m3 17 2 2 4-4"/><path d="m3 7 2 2 4-4"/><path d="M13 6h8M13 12h8M13 18h8"/></svg>,
  book: <svg viewBox="0 0 24 24"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>,
  sparkles: <svg viewBox="0 0 24 24"><path d="m12 3 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>,
  scan: <svg viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>,
  eyeOff: <svg viewBox="0 0 24 24"><path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.12-.88"/><path d="M10.73 5.08A11 11 0 0 1 12 5c5.5 0 9 6 9 6a14 14 0 0 1-2.08 2.92"/><path d="M6.61 6.61A14 14 0 0 0 3 11s3 6 9 6a9.7 9.7 0 0 0 5-1.39"/><path d="m2 2 20 20"/></svg>,
  lock: <svg viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  timer: <svg viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2"/><path d="M9 2h6"/></svg>,
  fileDown: <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></svg>,
  bell: <svg viewBox="0 0 24 24"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>,
  settings: <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/></svg>,
  refresh: <svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/></svg>,
  search: <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>,
  chevronRight: <svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"/></svg>,
  arrowRight: <svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  check: <svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-11"/></svg>,
  flame: <svg viewBox="0 0 24 24" fill="#d98912" stroke="none"><path d="M12 2.5c0 3.2 3.5 4 3.5 8a3.5 3.5 0 1 1-7 0c0-1.4.6-2.2 1.2-3-.1 1.2.4 2 1.3 2 .9 0 1.4-.8 1-2.2-.5-1.6-.3-3.4 0-4.8Z"/></svg>,
  play: <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M6 3.5v17l14-8.5Z"/></svg>,
};

const Icon = ({ name, size = 16, style }) => (
  <span style={{ display: 'inline-flex', width: size, height: size, color: 'currentColor', ...style }}>
    {React.cloneElement(I[name], {
      width: size, height: size,
      fill: I[name].props.fill || 'none',
      stroke: I[name].props.stroke !== undefined ? I[name].props.stroke : 'currentColor',
      strokeWidth: 1.6,
      strokeLinecap: 'round', strokeLinejoin: 'round',
    })}
  </span>
);

// ---------- Button ----------
const Button = ({ variant = 'primary', size = 'md', iconLeft, iconRight, children, glow, style, ...rest }) => {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-sans)',
    fontWeight: 500, borderRadius: 10, border: '1px solid transparent', cursor: 'pointer',
    transition: 'background 120ms, color 120ms, box-shadow 120ms', whiteSpace: 'nowrap',
  };
  const sizes = {
    sm: { fontSize: 13, padding: '7px 12px' },
    md: { fontSize: 14, padding: '10px 16px' },
    lg: { fontSize: 15, padding: '12px 20px' },
  };
  const variants = {
    primary: { background: 'var(--navy-800)', color: '#fff' },
    ai: { background: 'var(--teal-500)', color: '#fff', boxShadow: glow ? 'var(--shadow-glow-teal)' : 'var(--shadow-sm)' },
    secondary: { background: '#fff', color: 'var(--navy-800)', borderColor: 'var(--border-2)' },
    ghost: { background: 'transparent', color: 'var(--fg-2)' },
    danger: { background: 'var(--danger-500)', color: '#fff' },
  };
  return (
    <button {...rest} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}
      onMouseOver={e => e.currentTarget.style.filter = 'brightness(0.96)'}
      onMouseOut={e => e.currentTarget.style.filter = 'none'}>
      {iconLeft && <Icon name={iconLeft} size={size === 'lg' ? 18 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === 'lg' ? 18 : 16} />}
    </button>
  );
};

// ---------- Tag / Pill ----------
const Tag = ({ color = 'slate', mono, children, style }) => {
  const palettes = {
    navy: { bg: 'var(--navy-100)', fg: 'var(--navy-800)' },
    teal: { bg: 'var(--teal-100)', fg: 'var(--teal-800)' },
    slate: { bg: 'var(--slate-100)', fg: 'var(--slate-700)' },
    success: { bg: 'var(--success-50)', fg: 'var(--success-700)' },
    warn: { bg: 'var(--warn-50)', fg: 'var(--warn-700)' },
    danger: { bg: 'var(--danger-50)', fg: 'var(--danger-700)' },
    info: { bg: 'var(--info-50)', fg: 'var(--info-700)' },
  };
  const p = palettes[color];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, fontWeight: 500,
      padding: '4px 9px', borderRadius: 6, lineHeight: 1.3, background: p.bg, color: p.fg,
      fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
      letterSpacing: mono ? '0.04em' : 0, ...style
    }}>{children}</span>
  );
};

// ---------- Card ----------
const Card = ({ children, padding = 20, style, ...rest }) => (
  <div {...rest} style={{
    background: 'var(--bg-surface)', border: '1px solid var(--border-1)',
    borderRadius: 12, boxShadow: 'var(--shadow-xs)', padding, ...style
  }}>{children}</div>
);

// ---------- Streak ----------
const Streak = ({ days = 12 }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 6,
    background: '#fff', border: '1px solid var(--warn-200)',
    padding: '5px 10px 5px 8px', borderRadius: 9999,
    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: 'var(--warn-700)'
  }}>
    <Icon name="flame" size={14} />
    <span style={{ fontVariantNumeric: 'tabular-nums' }}>{days} dias</span>
  </div>
);

// ---------- Sparkline ----------
const Sparkline = ({ points, color = 'var(--teal-500)', width = 120, height = 32 }) => {
  const max = Math.max(...points), min = Math.min(...points);
  const d = points.map((p, i) => {
    const x = (i / (points.length - 1)) * (width - 2) + 1;
    const y = height - 2 - ((p - min) / (max - min || 1)) * (height - 4);
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
};

// ---------- MetricCard ----------
const MetricCard = ({ label, value, delta, spark, tone = 'default', footer }) => {
  const isBlind = tone === 'blind';
  return (
    <Card padding={18} style={isBlind ? {
      background: 'linear-gradient(180deg, var(--danger-50), #fff 65%)',
      borderColor: 'var(--danger-200)'
    } : {}}>
      <div style={{
        fontFamily: 'var(--font-sans)', fontSize: 11, fontWeight: 600,
        letterSpacing: '0.08em', textTransform: 'uppercase',
        color: isBlind ? 'var(--danger-700)' : 'var(--fg-3)'
      }}>{label}</div>
      <div style={{
        fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: 36, lineHeight: 1,
        letterSpacing: '-0.02em', color: isBlind ? 'var(--danger-700)' : 'var(--navy-900)',
        marginTop: 10, fontVariantNumeric: 'tabular-nums',
        fontVariationSettings: '"opsz" 48',
      }}>{value}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, marginTop: 10,
        fontFamily: 'var(--font-sans)', fontSize: 12, color: 'var(--fg-3)'
      }}>
        {delta && <span style={{ color: 'var(--success-700)', fontWeight: 600 }}>{delta}</span>}
        {spark && <Sparkline points={spark} />}
        {footer && <span>{footer}</span>}
      </div>
    </Card>
  );
};

Object.assign(window, { Icon, Button, Tag, Card, Streak, Sparkline, MetricCard });
