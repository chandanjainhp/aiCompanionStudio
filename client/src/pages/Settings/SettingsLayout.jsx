import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const settingsTabs = [
  { value: 'security',    label: 'SECURITY',     icon: Shield,  path: '/settings/security' },
  { value: 'preferences', label: 'PREFERENCES',  icon: Palette, path: '/settings/preferences' },
];

export function SettingsLayout({ children, activeTab }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-primary bg-background/90 backdrop-blur-md">
        <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-8 h-8 border-2 border-primary flex items-center justify-center hover:bg-muted/20 transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="font-display font-black uppercase text-[16px] tracking-tight leading-none">SETTINGS</div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-1">ACCOUNT CONFIGURATION</div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Sidebar nav */}
          <nav className="flex flex-col gap-2 w-full sm:w-[180px] shrink-0">
            {settingsTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  onClick={() => navigate(tab.path)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 font-mono text-[10px] font-bold tracking-[0.15em] uppercase text-left transition-colors border-l-2",
                    isActive
                      ? "text-primary bg-primary/10 border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/20"
                  )}
                >
                  <Icon size={14} />
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
            className="flex-1"
          >
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
