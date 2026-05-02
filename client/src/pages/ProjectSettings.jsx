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
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
      toast({ title: 'SETTINGS SAVED', description: 'Your project settings have been updated.' });
    } catch (error) {
      toast({ title: 'ERROR', description: error instanceof Error ? error.message : 'Failed to save settings', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!projectId) return;
    try {
      await deleteProject(projectId);
      toast({ title: 'PROJECT DELETED', description: 'Your project has been removed.' });
      navigate('/dashboard');
    } catch (error) {
      toast({ title: 'ERROR', description: error instanceof Error ? error.message : 'Failed to delete project', variant: 'destructive' });
    }
  };

  const applyTemplate = template => {
    setValue('systemPrompt', template.content, { shouldDirty: true });
    toast({ title: 'TEMPLATE APPLIED', description: `${template.name} template has been applied.` });
  };

  if (!currentProject) return null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b-2 border-primary bg-background/90 backdrop-blur-md">
        <div className="max-w-[900px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-8 h-8 border-2 border-primary flex items-center justify-center hover:bg-muted/20 transition-colors">
              <ArrowLeft size={16} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-2 border-primary flex items-center justify-center bg-background">
                <Bot size={16} className="text-primary" />
              </div>
              <div>
                <div className="font-display text-[16px] font-black uppercase tracking-tight leading-none">{currentProject.name}</div>
                <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.15em] mt-1">PROJECT SETTINGS</div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to={`/projects/${projectId}/chat`}>
              <Button variant="outline" className="rounded-none border-2 border-primary font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2">
                <MessageSquare size={14} />
                OPEN CHAT
              </Button>
            </Link>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={!isDirty || isLoading}
              className="rounded-none border-2 border-primary bg-primary text-background hover:bg-foreground font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  SAVING...
                </>
              ) : (
                <>
                  <Save size={14} />
                  SAVE
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-[900px] mx-auto px-6 py-8">
        {/* Tab bar */}
        <div className="flex gap-8 border-b-2 border-primary mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
              className={cn(
                "pb-3 font-mono text-[11px] font-bold tracking-[0.2em] uppercase relative transition-colors",
                activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-primary" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'GENERAL' && (
            <motion.div key="general" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-8">
              {/* Project info */}
              <div className="bg-muted/20 border-2 border-primary p-8">
                <div className="font-mono text-[11px] font-bold text-muted-foreground tracking-[0.25em] uppercase mb-8 pb-4 border-b-2 border-primary">
                  PROJECT INFORMATION
                </div>
                
                <div className="flex flex-col gap-6">
                  <div className="space-y-2">
                    <Label className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold block">PROJECT NAME</Label>
                    <Input 
                      className={cn("border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0", errors.name && "border-destructive")} 
                      {...register('name')} 
                    />
                    {errors.name && <p className="font-mono text-[10px] text-destructive tracking-[0.05em] uppercase mt-2">{errors.name.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold block">DESCRIPTION</Label>
                    <textarea
                      className="w-full bg-background border-2 border-primary text-foreground outline-none p-4 font-mono text-[12px] resize-y min-h-[100px] focus:border-foreground transition-colors placeholder:text-muted-foreground"
                      placeholder="What does this project do?"
                      {...register('description')}
                    />
                  </div>
                  
                  <div className="flex flex-wrap gap-12 pt-6 border-t-2 border-primary">
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase mb-2">CREATED</div>
                      <div className="font-mono text-[12px] font-bold tracking-[0.05em] uppercase">
                        {currentProject.createdAt ? format(new Date(currentProject.createdAt), 'MMM d, yyyy') : '—'}
                      </div>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase mb-2">CONVERSATIONS</div>
                      <div className="font-mono text-[12px] font-bold tracking-[0.05em] uppercase">{currentProject.conversationCount ?? 0}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Danger zone */}
              <div className="border-2 border-destructive bg-destructive/10 p-8">
                <div className="font-mono text-[11px] font-bold text-destructive tracking-[0.25em] uppercase mb-4">
                  DANGER ZONE
                </div>
                <p className="font-mono text-[12px] text-muted-foreground mb-6 leading-relaxed max-w-md">
                  Permanently delete this project and all its conversations. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="rounded-none border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2 h-12 px-6">
                      <Trash2 size={14} />
                      DELETE PROJECT
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-background border-2 border-primary rounded-none p-0 overflow-hidden">
                    <div className="p-8">
                      <AlertDialogHeader className="mb-6">
                        <AlertDialogTitle className="font-display text-[24px] font-black uppercase tracking-tight">
                          DELETE THIS PROJECT?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="font-mono text-[12px] text-muted-foreground leading-relaxed mt-4">
                          This will permanently delete "{currentProject.name}" and all its conversations. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-4 sm:gap-4 mt-8">
                        <AlertDialogCancel className="rounded-none border-2 border-primary font-mono text-[11px] font-bold tracking-[0.1em] uppercase m-0">CANCEL</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="rounded-none border-2 border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono text-[11px] font-bold tracking-[0.1em] uppercase m-0">
                          DELETE
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </motion.div>
          )}

          {activeTab === 'MODEL' && (
            <motion.div key="model" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              <div className="bg-muted/20 border-2 border-primary p-8">
                <div className="font-mono text-[11px] font-bold text-muted-foreground tracking-[0.25em] uppercase mb-8 pb-4 border-b-2 border-primary">
                  MODEL CONFIGURATION
                </div>

                <div className="flex flex-col gap-8">
                  {/* Model select */}
                  <div className="space-y-2">
                    <Label className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold block">AI MODEL</Label>
                    <div className="relative">
                      <select
                        className="w-full bg-background border-2 border-primary text-foreground outline-none p-3 pl-4 pr-10 font-mono text-[12px] appearance-none focus:border-foreground transition-colors cursor-pointer"
                        value={model}
                        onChange={e => setValue('model', e.target.value, { shouldDirty: true })}
                      >
                        {models.map(m => (
                          <option key={m.value} value={m.value}>
                            {m.label} [{m.provider}]
                          </option>
                        ))}
                      </select>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>

                  {/* Temperature */}
                  <div className="space-y-4 pt-4 border-t-2 border-primary/20">
                    <div className="flex justify-between items-baseline">
                      <Label className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold block">TEMPERATURE</Label>
                      <span className="font-display text-[20px] font-black text-primary">{temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      className="w-full h-1 bg-primary appearance-none outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-foreground [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-foreground [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-none [&::-webkit-slider-thumb]:rounded-none"
                      min={0} max={1} step={0.1}
                      value={temperature}
                      onChange={e => setValue('temperature', parseFloat(e.target.value), { shouldDirty: true })}
                    />
                    <div className="flex justify-between">
                      <span className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase">FOCUSED</span>
                      <span className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase">CREATIVE</span>
                    </div>
                  </div>

                  {/* Max tokens */}
                  <div className="space-y-2 pt-4 border-t-2 border-primary/20">
                    <Label className="font-mono text-[11px] uppercase tracking-[0.15em] font-bold block">MAX TOKENS</Label>
                    <Input
                      type="number"
                      className="border-2 border-primary rounded-none h-12 font-mono text-[12px] bg-background focus-visible:ring-0 max-w-[200px]"
                      min={256} max={8192}
                      {...register('maxTokens', { valueAsNumber: true })}
                    />
                    <p className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase mt-2">RANGE: 256 – 8192</p>
                  </div>

                  {/* Reset defaults */}
                  <div className="pt-8 border-t-2 border-primary flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-none border-2 border-primary font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2 h-12 px-6"
                      onClick={() => {
                        setValue('temperature', 0.7, { shouldDirty: true });
                        setValue('maxTokens', 2048, { shouldDirty: true });
                      }}
                    >
                      <RotateCcw size={14} />
                      RESET DEFAULTS
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'PROMPTS' && (
            <motion.div key="prompts" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-8">
              {/* System prompt editor — WIRED editorial style */}
              <div className="border-2 border-foreground bg-background overflow-hidden relative group">
                <div className="flex justify-between items-baseline px-6 py-3 border-b-2 border-foreground bg-foreground text-background">
                  <span className="font-mono text-[12px] font-bold tracking-[0.2em] uppercase">SYSTEM PROMPT</span>
                  <span className={cn("font-mono text-[10px] font-bold tracking-[0.1em] uppercase", systemPrompt?.length > 3600 ? "text-destructive" : "text-background/70")}>
                    {systemPrompt?.length || 0}&nbsp;/&nbsp;4000
                  </span>
                </div>
                <textarea
                  className="w-full bg-background text-foreground border-none outline-none p-6 font-mono text-[13px] leading-relaxed resize-y min-h-[300px] placeholder:text-muted-foreground placeholder:italic"
                  placeholder="You are a helpful assistant..."
                  {...register('systemPrompt')}
                />
                <div className="flex gap-8 items-center px-6 py-3 border-t-2 border-foreground bg-muted/20">
                  <span className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase font-bold">
                    {systemPrompt ? `~${Math.ceil(systemPrompt.split(/\\s+/).filter(Boolean).length / 150)} MIN READ` : 'NO PROMPT'}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground tracking-[0.1em] uppercase font-bold">
                    {systemPrompt ? `${systemPrompt.split(/\\s+/).filter(Boolean).length} WORDS` : '—'}
                  </span>
                  {systemPrompt?.length > 3600 && (
                    <span className="font-mono text-[10px] text-destructive tracking-[0.1em] uppercase font-bold ml-auto">
                      APPROACHING LIMIT
                    </span>
                  )}
                </div>
              </div>

              {/* Templates */}
              <div className="bg-muted/20 border-2 border-primary p-8">
                <div className="font-mono text-[11px] font-bold text-muted-foreground tracking-[0.25em] uppercase mb-8 pb-4 border-b-2 border-primary">
                  PROMPT TEMPLATES
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {promptTemplates.map(template => (
                    <button 
                      key={template.id} 
                      className="bg-background border-2 border-primary p-6 text-left hover:bg-foreground hover:text-background transition-colors group flex items-start gap-4" 
                      onClick={() => applyTemplate(template)}
                    >
                      <div className="w-10 h-10 border-2 border-primary bg-muted/20 flex items-center justify-center flex-shrink-0 group-hover:border-background group-hover:bg-background/20">
                        <template.icon size={18} className="text-primary group-hover:text-background" />
                      </div>
                      <div>
                        <div className="font-display text-[16px] font-black uppercase tracking-tight mb-2">{template.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground group-hover:text-background/80 leading-relaxed">
                          {template.description}
                        </div>
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
