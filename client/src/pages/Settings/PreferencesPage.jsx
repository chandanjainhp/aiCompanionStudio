import { Sun, Moon, Monitor } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { SettingsLayout } from './SettingsLayout';
import { cn } from '@/lib/utils';

const themes = [
  { value: 'light',  label: 'LIGHT',  Icon: Sun,     desc: 'Bright workspace' },
  { value: 'dark',   label: 'DARK',   Icon: Moon,    desc: 'Default dark mode' },
  { value: 'system', label: 'SYSTEM', Icon: Monitor, desc: 'Follow OS setting' },
];

export default function PreferencesPage() {
  const { theme, setTheme } = useUIStore();

  return (
    <SettingsLayout activeTab="preferences">
      <div className="bg-muted/20 border-2 border-primary p-6 sm:p-8">
        <div className="font-mono text-[11px] text-muted-foreground tracking-[0.25em] uppercase mb-8 font-bold">
          APPEARANCE
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {themes.map(({ value, label, Icon, desc }) => {
            const isActive = theme === value;
            return (
              <button
                key={value}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 border-2 transition-all cursor-pointer text-center outline-none focus-visible:ring-2 focus-visible:ring-foreground",
                  isActive 
                    ? "border-primary bg-primary/10" 
                    : "border-primary/20 bg-background hover:border-primary hover:bg-muted/10"
                )}
                onClick={() => setTheme(value)}
              >
                <div
                  className={cn(
                    "w-10 h-10 flex items-center justify-center transition-colors",
                    isActive ? "bg-primary text-background" : "bg-muted/20 text-muted-foreground"
                  )}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div className={cn(
                    "font-mono text-[11px] font-bold tracking-[0.15em] uppercase mb-1",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}>
                    {label}
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.05em]">
                    {desc}
                  </div>
                </div>
                {isActive && (
                  <div className="font-mono text-[9px] font-bold text-primary tracking-[0.1em] mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    ACTIVE
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
