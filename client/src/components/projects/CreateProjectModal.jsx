import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Loader2, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useProjectsStore } from '@/store/projectsStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  model: z.enum(['openai/gpt-4-turbo', 'openai/gpt-4', 'openai/gpt-3.5-turbo', 'anthropic/claude-3-opus-20250219', 'anthropic/claude-3-sonnet-20250229', 'meta-llama/llama-3.1-405b', 'mistralai/mistral-large'], {
    errorMap: () => ({ message: 'Please select a valid AI model' })
  }),
  temperature: z.number().min(0, 'Temperature must be between 0 and 1').max(1, 'Temperature must be between 0 and 1'),
  maxTokens: z.number().int('Max tokens must be a whole number').min(256, 'Max tokens must be at least 256').max(8192, 'Max tokens cannot exceed 8192'),
  systemPrompt: z.string().min(1, 'System prompt is required').max(4000, 'System prompt must be less than 4000 characters')
});

const models = [
  { value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)', description: 'Latest GPT-4 with improved performance', available: true },
  { value: 'openai/gpt-4-32k', label: 'GPT-4 32K (OpenAI)', description: 'Extended context window for longer documents', available: true },
  { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', description: 'Fast and cost-effective', available: true }
];

export function CreateProjectModal({ children, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createProject } = useProjectsStore();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      model: 'openai/gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: 'You are a helpful AI assistant. Be professional, accurate, and concise in your responses.'
    }
  });

  const temperature = watch('temperature');
  const model = watch('model');

  const onSubmit = async data => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await createProject({
        name: data.name,
        description: data.description,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        systemPrompt: data.systemPrompt
      });
      toast({
        title: 'PROJECT CREATED',
        description: `${data.name} is ready to use.`
      });
      setOpen(false);
      reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'FAILED TO CREATE',
        description: 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2 font-mono tracking-[0.1em] text-[11px] uppercase">
            <Plus className="w-4 h-4" />
            NEW PROJECT
          </Button>
        )}
      </DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto bg-background border-2 border-primary text-foreground p-0 rounded-none shadow-none">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <DialogHeader className="mb-6 pb-6 border-b-2 border-primary">
                <DialogTitle className="flex items-center gap-3 font-display text-[24px]">
                  <div className="w-8 h-8 bg-background border-2 border-primary flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  CREATE NEW PROJECT
                </DialogTitle>
                <DialogDescription className="font-body text-[14px] text-muted-foreground mt-2">
                  Set up a new AI agent with custom model and prompt configuration.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-mono uppercase tracking-[0.1em] text-[11px] font-bold">PROJECT NAME</Label>
                    <Input id="name" placeholder="e.g., Customer Support Bot" {...register('name')} className={cn("border-2 border-primary rounded-none h-10", errors.name ? 'border-destructive' : '')} maxLength={100} />
                    {errors.name && <p className="text-[11px] font-mono text-destructive uppercase">{errors.name.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="font-mono uppercase tracking-[0.1em] text-[11px] font-bold">DESCRIPTION</Label>
                    <Textarea id="description" placeholder="What does this agent do? What's its purpose?" rows={2} {...register('description')} className={cn("border-2 border-primary rounded-none resize-none", errors.description ? 'border-destructive' : '')} maxLength={500} />
                    {errors.description && <p className="text-[11px] font-mono text-destructive uppercase">{errors.description.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label className="font-mono uppercase tracking-[0.1em] text-[11px] font-bold">AI MODEL</Label>
                    <Select value={model} onValueChange={value => setValue('model', value)}>
                      <SelectTrigger className="border-2 border-primary rounded-none h-10">
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent className="border-2 border-primary rounded-none bg-background">
                        {models.map(m => (
                          <SelectItem key={m.value} value={m.value} disabled={!m.available} className={cn("rounded-none", !m.available ? "opacity-50 cursor-not-allowed" : "")}>
                            <div className="flex flex-col">
                              <span className="flex items-center gap-2 font-bold font-sans">
                                {m.label}
                                {!m.available && <span className="text-[9px] font-mono bg-muted px-1 py-0 border border-primary uppercase tracking-wider">Unavailable</span>}
                              </span>
                              <span className="text-[11px] font-body text-muted-foreground">{m.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 p-4 border-2 border-primary bg-muted/20">
                    <div className="flex items-center justify-between">
                      <Label className="font-mono uppercase tracking-[0.1em] text-[11px] font-bold">TEMPERATURE (0.0 - 1.0)</Label>
                      <span className="font-mono text-[14px] font-bold text-primary border-b-2 border-primary w-12 text-center">
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider value={[temperature]} onValueChange={([value]) => setValue('temperature', value)} min={0} max={1} step={0.1} className="cursor-pointer" />
                    <div className="flex justify-between gap-2">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase"><span className="font-bold">0.0</span> = DETERMINISTIC</p>
                      <p className="text-[10px] font-mono text-muted-foreground uppercase"><span className="font-bold">1.0</span> = CREATIVE</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens" className="font-mono uppercase tracking-[0.1em] text-[11px] font-bold">MAX TOKENS</Label>
                    <Input id="maxTokens" type="number" min={256} max={8192} {...register('maxTokens', { valueAsNumber: true })} className={cn("border-2 border-primary rounded-none h-10 font-mono", errors.maxTokens ? 'border-destructive' : '')} />
                    {errors.maxTokens && <p className="text-[11px] font-mono text-destructive uppercase">{errors.maxTokens.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt" className="font-mono uppercase tracking-[0.1em] text-[11px] font-bold">SYSTEM PROMPT</Label>
                    <Textarea id="systemPrompt" placeholder="Define your AI agent's behavior..." rows={4} {...register('systemPrompt')} className={cn("border-2 border-primary rounded-none font-mono text-[12px] resize-none", errors.systemPrompt ? 'border-destructive' : '')} maxLength={4000} />
                    {errors.systemPrompt && <p className="text-[11px] font-mono text-destructive uppercase">{errors.systemPrompt.message}</p>}
                  </div>
                </div>

                <DialogFooter className="gap-4 pt-6 border-t-2 border-primary sm:space-x-0">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} className="font-mono uppercase tracking-[0.1em] text-[11px] border-2 border-primary hover:bg-foreground hover:text-background rounded-none">
                    CANCEL
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="font-mono uppercase tracking-[0.1em] text-[11px] bg-primary text-background hover:bg-foreground hover:text-background border-2 border-primary rounded-none">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        CREATING...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 mr-2" />
                        CREATE PROJECT
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}