import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Palette } from 'lucide-react';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  accent: '#E8961E',
  accentFaint: 'rgba(232,150,30,0.08)',
  text: '#F0E8D8',
  muted: '#7A6A54',
};

const settingsTabs = [
  { value: 'security',    label: 'SECURITY',     icon: Shield,  path: '/settings/security' },
  { value: 'preferences', label: 'PREFERENCES',  icon: Palette, path: '/settings/preferences' },
];

export function SettingsLayout({ children, activeTab }) {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text }}>
      <style>{`
        .sl-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .sl-nav-btn { background: transparent; border: none; cursor: pointer; width: 100%; display: flex; align-items: center; gap: 10px; padding: 10px 12px; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.18em; transition: all 0.15s; text-align: left; }
        .sl-nav-btn:hover:not(.active) { color: ${DB.text} !important; background: rgba(255,255,255,0.03) !important; }
        .sl-back { background: transparent; border: 1px solid ${DB.border}; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: ${DB.muted}; transition: color 0.15s; }
        .sl-back:hover { color: ${DB.accent} !important; }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 56, zIndex: 40, borderBottom: `1px solid ${DB.border}`, background: `${DB.bg}ee`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, height: 60 }}>
            <button onClick={() => navigate(-1)} className="sl-back">
              <ArrowLeft size={12} />
            </button>
            <div>
              <div className="sl-mono" style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.02em' }}>SETTINGS</div>
              <div className="sl-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em' }}>ACCOUNT CONFIGURATION</div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24 }} className="block sm:grid">

          {/* Sidebar nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {settingsTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  className={`sl-nav-btn${isActive ? ' active' : ''}`}
                  onClick={() => navigate(tab.path)}
                  style={{
                    color: isActive ? DB.accent : DB.muted,
                    background: isActive ? DB.accentFaint : 'transparent',
                    borderLeft: isActive ? `2px solid ${DB.accent}` : '2px solid transparent',
                  }}
                >
                  <Icon size={12} />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content area */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
