import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
const settingsTabs = [{
  value: 'security',
  label: 'Security',
  icon: <Shield className="w-4 h-4" />,
  path: '/settings/security'
}, {
  value: 'preferences',
  label: 'Preferences',
  icon: <Palette className="w-4 h-4" />,
  path: '/settings/preferences'
}];
export function SettingsLayout({
  children,
  activeTab
}) {
  const navigate = useNavigate();
  return <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8 max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <nav className="md:col-span-1">
            <div className="space-y-2">
              {settingsTabs.map(tab => <button key={tab.value} onClick={() => navigate(tab.path)} className={cn('w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-left', activeTab === tab.value ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-foreground')}>
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                </button>)}
            </div>
          </nav>

          {/* Content Area */}
          <motion.div key={activeTab} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} exit={{
          opacity: 0,
          y: -10
        }} transition={{
          duration: 0.2
        }} className="md:col-span-3">
            {children}
          </motion.div>
        </div>
      </div>
    </div>;
}