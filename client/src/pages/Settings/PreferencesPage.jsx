import { Sun, Moon, Monitor } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { SettingsLayout } from './SettingsLayout';

const DB = {
  surface: '#161210',
  border: '#252018',
  borderBright: '#352C1C',
  accent: '#E8961E',
  accentFaint: 'rgba(232,150,30,0.08)',
  text: '#F0E8D8',
  muted: '#7A6A54',
};

const themes = [
  { value: 'light',  label: 'LIGHT',  Icon: Sun,     desc: 'Bright workspace' },
  { value: 'dark',   label: 'DARK',   Icon: Moon,    desc: 'Default dark mode' },
  { value: 'system', label: 'SYSTEM', Icon: Monitor, desc: 'Follow OS setting' },
];

export default function PreferencesPage() {
  const { theme, setTheme } = useUIStore();

  return (
    <SettingsLayout activeTab="preferences">
      <style>{`
        .pref-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .pref-theme-card { background: #0E0C0A; border: 1px solid ${DB.border}; padding: 20px 16px; cursor: pointer; transition: all 0.15s; display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .pref-theme-card:hover { border-color: ${DB.accent}; background: ${DB.accentFaint}; }
        .pref-theme-card.active { border-color: ${DB.accent}; background: ${DB.accentFaint}; }
      `}</style>

      <div style={{ background: DB.surface, border: `1px solid ${DB.border}`, padding: 28 }}>
        <div className="pref-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 24 }}>
          APPEARANCE
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {themes.map(({ value, label, Icon, desc }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                className={`pref-theme-card${isActive ? ' active' : ''}`}
                onClick={() => setTheme(value)}
              >
                <div
                  style={{
                    width: 36, height: 36,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isActive ? DB.accent : DB.borderBright,
                    transition: 'background 0.15s',
                  }}
                >
                  <Icon size={16} style={{ color: isActive ? '#0E0C0A' : DB.muted }} />
                </div>
                <div>
                  <div className="pref-mono" style={{ fontSize: 9, color: isActive ? DB.accent : DB.muted, letterSpacing: '0.15em', marginBottom: 3 }}>
                    {label}
                  </div>
                  <div className="pref-mono" style={{ fontSize: 8, color: DB.muted }}>
                    {desc}
                  </div>
                </div>
                {isActive && (
                  <div className="pref-mono" style={{ fontSize: 7, color: DB.accent, letterSpacing: '0.1em' }}>
                    ● ACTIVE
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </SettingsLayout>
  );
}
