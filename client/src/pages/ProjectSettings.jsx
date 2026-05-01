import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Trash2, RotateCcw, Bot, Sparkles, Code, MessageSquare, FileText, Loader2, ChevronRight,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProjectsStore } from '@/store/projectsStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  surfaceHover: '#1C1814',
  border: '#252018',
  borderBright: '#352C1C',
  accent: '#E8961E',
  accentDark: '#9A5E0A',
  accentFaint: 'rgba(232,150,30,0.08)',
  text: '#F0E8D8',
  muted: '#7A6A54',
  green: '#4ADE80',
  red: '#FF5C5C',
  redFaint: 'rgba(255,92,92,0.06)',
};

const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  model: z.enum([
    'openai/gpt-4-turbo', 'openai/gpt-4', 'openai/gpt-3.5-turbo',
    'anthropic/claude-3-opus-20250219', 'anthropic/claude-3-sonnet-20250229',
    'meta-llama/llama-3.1-405b', 'mistralai/mistral-large',
  ]),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(256).max(8192),
  systemPrompt: z.string(),
});

const models = [
  { value: 'openai/gpt-4-turbo',    label: 'GPT-4 Turbo',    provider: 'OPENAI' },
  { value: 'openai/gpt-4-32k',      label: 'GPT-4 32K',       provider: 'OPENAI' },
  { value: 'openai/gpt-3.5-turbo',  label: 'GPT-3.5 Turbo',  provider: 'OPENAI' },
];

const promptTemplates = [
  { id: 'customer-support', name: 'Customer Support Agent', icon: MessageSquare, description: 'Helpful and professional support', content: `You are a customer support agent for our company. Your role is to:\n- Answer questions about our products and services\n- Help resolve customer issues quickly and professionally\n- Maintain a friendly and helpful tone at all times\n- Escalate complex issues when necessary\n\nAlways start by acknowledging the customer's concern and provide clear, actionable solutions.` },
  { id: 'code-assistant',   name: 'Code Assistant',          icon: Code,          description: 'Programming help and code review', content: `You are an expert programming assistant. Your role is to:\n- Help debug code and identify issues\n- Suggest best practices and improvements\n- Explain complex concepts in simple terms\n- Provide working code examples\n\nAlways consider edge cases and provide clean, well-documented code.` },
  { id: 'creative-writer',  name: 'Creative Writer',          icon: Sparkles,      description: 'Content creation and copywriting', content: `You are a creative writer with expertise in various writing styles. Your role is to:\n- Create engaging and original content\n- Adapt your writing style to match the audience\n- Suggest creative ideas and angles\n- Edit and improve existing content\n\nBe imaginative while maintaining clarity and purpose in your writing.` },
  { id: 'data-analyst',     name: 'Data Analyst',             icon: FileText,      description: 'Data interpretation and insights', content: `You are a data analyst helping users understand their data. Your role is to:\n- Interpret data patterns and trends\n- Provide actionable insights\n- Suggest visualization approaches\n- Explain statistical concepts clearly\n\nFocus on practical applications and business implications of the data.` },
];

const TABS = ['GENERAL', 'MODEL', 'PROMPTS'];

export default function ProjectSettings() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { currentProject, updateProject, deleteProject, fetchProject, isLoading } = useProjectsStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('GENERAL');

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isDirty } } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: { name: '', description: '', model: 'openai/gpt-4-turbo', temperature: 0.7, maxTokens: 2048, systemPrompt: '' },
  });

  const temperature = watch('temperature');
  const model = watch('model');
  const systemPrompt = watch('systemPrompt');

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId).catch(() => navigate('/dashboard'));
    }
  }, [projectId, fetchProject, navigate]);

  useEffect(() => {
    if (currentProject) {
      reset({
        name: currentProject.name,
        description: currentProject.description || '',
        model: currentProject.model,
        temperature: currentProject.temperature,
        maxTokens: currentProject.maxTokens,
        systemPrompt: currentProject.systemPrompt || '',
      });
    }
  }, [currentProject, reset]);

  const onSubmit = async data => {
    if (!projectId) return;
    try {
      await updateProject(projectId, data);
      toast({ title: 'Settings saved', description: 'Your project settings have been updated.' });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save settings', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await deleteProject(projectId);
      toast({ title: 'Project deleted', description: 'Your project has been removed.' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to delete project', variant: 'destructive' });
    }
  };

  const applyTemplate = template => {
    setValue('systemPrompt', template.content, { shouldDirty: true });
    toast({ title: 'Template applied', description: `${template.name} template has been applied.` });
  };

  if (!currentProject) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text }}>
      <style>{`
        .ps-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .ps-input { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 12px; font-family: 'JetBrains Mono', monospace; width: 100%; transition: border-color 0.15s; }
        .ps-input::placeholder { color: ${DB.muted}; }
        .ps-input:focus { border-color: ${DB.accent}; }
        .ps-input.error { border-color: ${DB.red}; }
        .ps-textarea { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; width: 100%; resize: vertical; transition: border-color 0.15s; line-height: 1.6; }
        .ps-textarea::placeholder { color: ${DB.muted}; }
        .ps-textarea:focus { border-color: ${DB.accent}; }
        .ps-select { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 10px 12px; font-size: 11px; font-family: 'JetBrains Mono', monospace; width: 100%; cursor: pointer; transition: border-color 0.15s; appearance: none; }
        .ps-select:focus { border-color: ${DB.accent}; }
        .ps-select option { background: ${DB.surface}; color: ${DB.text}; }
        .ps-btn-primary { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 10px 20px; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; display: inline-flex; align-items: center; gap: 6px; }
        .ps-btn-primary:hover:not(:disabled) { background: ${DB.accentDark}; }
        .ps-btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }
        .ps-btn-ghost { background: transparent; color: ${DB.muted}; border: 1px solid ${DB.border}; padding: 8px 14px; font-size: 10px; letter-spacing: 0.1em; cursor: pointer; transition: all 0.15s; font-family: 'JetBrains Mono', monospace; display: inline-flex; align-items: center; gap: 6px; }
        .ps-btn-ghost:hover { color: ${DB.text}; border-color: ${DB.muted}; }
        .ps-btn-danger { background: transparent; color: ${DB.red}; border: 1px solid ${DB.red}; padding: 9px 16px; font-size: 10px; letter-spacing: 0.12em; cursor: pointer; transition: all 0.15s; font-family: 'JetBrains Mono', monospace; display: inline-flex; align-items: center; gap: 6px; }
        .ps-btn-danger:hover { background: ${DB.redFaint}; }
        .ps-tab { background: transparent; border: none; cursor: pointer; padding: 10px 0; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: ${DB.muted}; transition: color 0.15s; position: relative; }
        .ps-tab.active { color: ${DB.accent}; }
        .ps-tab.active::after { content: ''; position: absolute; bottom: -1px; left: 0; right: 0; height: 1px; background: ${DB.accent}; }
        .ps-tab:hover:not(.active) { color: ${DB.text}; }
        .ps-section { background: ${DB.surface}; border: 1px solid ${DB.border}; padding: 28px 32px; margin-bottom: 2px; }
        .ps-template-card { background: ${DB.bg}; border: 1px solid ${DB.border}; padding: 14px 16px; cursor: pointer; transition: all 0.15s; display: flex; align-items: flex-start; gap: 12px; text-align: left; width: 100%; }
        .ps-template-card:hover { border-color: ${DB.accent}; background: ${DB.accentFaint}; }
        .ps-range { -webkit-appearance: none; width: 100%; height: 3px; background: ${DB.border}; outline: none; border-radius: 0; }
        .ps-range::-webkit-slider-thumb { -webkit-appearance: none; width: 14px; height: 14px; background: ${DB.accent}; cursor: pointer; border-radius: 0; }
        .ps-range::-moz-range-thumb { width: 14px; height: 14px; background: ${DB.accent}; cursor: pointer; border: none; border-radius: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 56, zIndex: 40, borderBottom: `1px solid ${DB.border}`, background: `${DB.bg}ee`, backdropFilter: 'blur(12px)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <button onClick={() => navigate(-1)} className="ps-btn-ghost" style={{ padding: '6px 10px' }}>
                <ArrowLeft size={12} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, background: DB.borderBright, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={16} style={{ color: DB.accent }} />
                </div>
                <div>
                  <div className="ps-mono" style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.05em' }}>{currentProject.name}</div>
                  <div className="ps-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.2em' }}>PROJECT SETTINGS</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/projects/${projectId}/chat`} style={{ textDecoration: 'none' }}>
                <button className="ps-btn-ghost">
                  <MessageSquare size={11} />
                  OPEN CHAT
                </button>
              </Link>
              <button
                className="ps-btn-primary"
                onClick={handleSubmit(onSubmit)}
                disabled={!isDirty || isLoading}
              >
                {isLoading ? (
                  <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />SAVING...</>
                ) : (
                  <><Save size={12} />SAVE</>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 28, borderBottom: `1px solid ${DB.border}`, marginBottom: 24 }}>
          {TABS.map(tab => (
            <button
              key={tab}
              className={`ps-tab${activeTab === tab ? ' active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'GENERAL' && (
            <motion.div key="general" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

              {/* Project info */}
              <div className="ps-section">
                <div className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 24 }}>PROJECT INFORMATION</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  <div>
                    <label className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>PROJECT NAME</label>
                    <input className={`ps-input${errors.name ? ' error' : ''}`} {...register('name')} />
                    {errors.name && <p className="ps-mono" style={{ fontSize: 9, color: DB.red, marginTop: 6 }}>{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>DESCRIPTION</label>
                    <textarea
                      className="ps-textarea"
                      rows={3}
                      placeholder="What does this project do?"
                      {...register('description')}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: 32, paddingTop: 8, borderTop: `1px solid ${DB.border}` }}>
                    <div>
                      <div className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.1em', marginBottom: 4 }}>CREATED</div>
                      <div className="ps-mono" style={{ fontSize: 10, color: DB.text }}>
                        {currentProject.createdAt ? format(new Date(currentProject.createdAt), 'MMM d, yyyy').toUpperCase() : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.1em', marginBottom: 4 }}>CONVERSATIONS</div>
                      <div className="ps-mono" style={{ fontSize: 10, color: DB.text }}>{currentProject.conversationCount ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ height: 2 }} />

              {/* Danger zone */}
              <div className="ps-section" style={{ borderColor: `${DB.red}40`, background: DB.redFaint }}>
                <div className="ps-mono" style={{ fontSize: 9, color: DB.red, letterSpacing: '0.25em', marginBottom: 8 }}>DANGER ZONE</div>
                <p className="ps-mono" style={{ fontSize: 10, color: DB.muted, marginBottom: 20, lineHeight: 1.6 }}>
                  Permanently delete this project and all its conversations. Cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="ps-btn-danger">
                      <Trash2 size={11} />
                      DELETE PROJECT
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent style={{ background: DB.surface, border: `1px solid ${DB.border}`, borderRadius: 0, color: DB.text }}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="ps-mono" style={{ fontSize: 13, color: DB.text, letterSpacing: '0.05em' }}>
                        Delete this project?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="ps-mono" style={{ fontSize: 11, color: DB.muted, lineHeight: 1.6 }}>
                        This will permanently delete "{currentProject.name}" and all its conversations. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="ps-btn-ghost" style={{ border: `1px solid ${DB.border}` }}>CANCEL</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete} className="ps-btn-danger" style={{ background: DB.redFaint }}>
                        DELETE
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

            </motion.div>
          )}

          {activeTab === 'MODEL' && (
            <motion.div key="model" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="ps-section">
                <div className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 24 }}>MODEL CONFIGURATION</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                  {/* Model select */}
                  <div>
                    <label className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>AI MODEL</label>
                    <div style={{ position: 'relative' }}>
                      <select
                        className="ps-select"
                        value={model}
                        onChange={e => setValue('model', e.target.value, { shouldDirty: true })}
                      >
                        {models.map(m => (
                          <option key={m.value} value={m.value}>
                            {m.label} [{m.provider}]
                          </option>
                        ))}
                      </select>
                      <ChevronRight size={12} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%) rotate(90deg)', color: DB.muted, pointerEvents: 'none' }} />
                    </div>
                  </div>

                  {/* Temperature */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                      <label className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em' }}>TEMPERATURE</label>
                      <span className="ps-mono" style={{ fontSize: 14, color: DB.accent, fontWeight: 700 }}>{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      className="ps-range"
                      min={0} max={1} step={0.1}
                      value={temperature}
                      onChange={e => setValue('temperature', parseFloat(e.target.value), { shouldDirty: true })}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span className="ps-mono" style={{ fontSize: 8, color: DB.muted }}>FOCUSED</span>
                      <span className="ps-mono" style={{ fontSize: 8, color: DB.muted }}>CREATIVE</span>
                    </div>
                  </div>

                  {/* Max tokens */}
                  <div>
                    <label className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.15em', display: 'block', marginBottom: 8 }}>MAX TOKENS</label>
                    <input
                      type="number"
                      className="ps-input"
                      min={256} max={8192}
                      {...register('maxTokens', { valueAsNumber: true })}
                    />
                    <p className="ps-mono" style={{ fontSize: 9, color: DB.muted, marginTop: 6 }}>RANGE: 256 – 8192</p>
                  </div>

                  {/* Reset defaults */}
                  <div>
                    <button
                      type="button"
                      className="ps-btn-ghost"
                      onClick={() => {
                        setValue('temperature', 0.7, { shouldDirty: true });
                        setValue('maxTokens', 2048, { shouldDirty: true });
                      }}
                    >
                      <RotateCcw size={11} />
                      RESET DEFAULTS
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'PROMPTS' && (
            <motion.div key="prompts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

              {/* System prompt editor */}
              <div className="ps-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
                  <div className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em' }}>SYSTEM PROMPT</div>
                  <div className="ps-mono" style={{ fontSize: 9, color: systemPrompt?.length > 3600 ? DB.red : DB.muted }}>
                    {systemPrompt?.length || 0} / 4000
                  </div>
                </div>
                <textarea
                  className="ps-textarea"
                  rows={12}
                  placeholder="You are a helpful assistant..."
                  {...register('systemPrompt')}
                />
              </div>

              {/* Templates */}
              <div className="ps-section">
                <div className="ps-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 20 }}>PROMPT TEMPLATES</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 2 }}>
                  {promptTemplates.map(template => (
                    <button key={template.id} className="ps-template-card" onClick={() => applyTemplate(template)}>
                      <div style={{ width: 32, height: 32, background: DB.borderBright, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <template.icon size={15} style={{ color: DB.accent }} />
                      </div>
                      <div>
                        <div className="ps-mono" style={{ fontSize: 10, color: DB.text, marginBottom: 3, letterSpacing: '0.03em' }}>{template.name}</div>
                        <div className="ps-mono" style={{ fontSize: 9, color: DB.muted }}>{template.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
