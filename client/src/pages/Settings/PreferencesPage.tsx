import { Sun, Moon, Monitor } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';
import { SettingsLayout } from './SettingsLayout';

interface Theme {
  value: 'light' | 'dark' | 'system';
  label: string;
  icon: React.ReactNode;
}

const themes: Theme[] = [
  { value: 'light', label: 'Light', icon: <Sun className="w-5 h-5" /> },
  { value: 'dark', label: 'Dark', icon: <Moon className="w-5 h-5" /> },
  { value: 'system', label: 'System', icon: <Monitor className="w-5 h-5" /> },
];

export default function PreferencesPage() {
  const { theme, setTheme } = useUIStore();

  return (
    <SettingsLayout activeTab="preferences">
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>
            Customize how the app looks and feels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme}
            onValueChange={(value) => setTheme(value as 'light' | 'dark' | 'system')}
            className="grid grid-cols-3 gap-4"
          >
            {themes.map((t) => (
              <Label
                key={t.value}
                htmlFor={t.value}
                className={cn(
                  'flex flex-col items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all',
                  theme === t.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <RadioGroupItem value={t.value} id={t.value} className="sr-only" />
                <div
                  className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center',
                    theme === t.value ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  )}
                >
                  {t.icon}
                </div>
                <span className="font-medium text-sm">{t.label}</span>
              </Label>
            ))}
          </RadioGroup>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
