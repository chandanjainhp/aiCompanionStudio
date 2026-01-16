import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Loader2, Bot, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProjectsStore } from '@/store/projectsStore';
import { useToast } from '@/hooks/use-toast';
import type { AIModel } from '@/types';

const projectSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional().or(z.literal('')),
  model: z.enum(['openai/gpt-4-turbo', 'openai/gpt-4', 'openai/gpt-3.5-turbo', 'anthropic/claude-3-opus-20250219', 'anthropic/claude-3-sonnet-20250229', 'meta-llama/llama-3.1-405b', 'mistralai/mistral-large'], {
    errorMap: () => ({ message: 'Please select a valid AI model' }),
  }),
  temperature: z.number().min(0, 'Temperature must be between 0 and 1').max(1, 'Temperature must be between 0 and 1'),
  maxTokens: z.number()
    .int('Max tokens must be a whole number')
    .min(256, 'Max tokens must be at least 256')
    .max(8192, 'Max tokens cannot exceed 8192'),
  systemPrompt: z.string()
    .min(1, 'System prompt is required')
    .max(4000, 'System prompt must be less than 4000 characters'),
});

type ProjectForm = z.infer<typeof projectSchema>;

const models: { value: AIModel; label: string; description: string }[] = [
  { value: 'openai/gpt-4-turbo', label: 'GPT-4 Turbo (OpenAI)', description: 'Latest GPT-4 with improved performance' },
  { value: 'openai/gpt-4', label: 'GPT-4 (OpenAI)', description: 'Advanced reasoning and multi-modal capabilities' },
  { value: 'openai/gpt-3.5-turbo', label: 'GPT-3.5 Turbo (OpenAI)', description: 'Fast and cost-effective' },
  { value: 'anthropic/claude-3-opus-20250219', label: 'Claude 3 Opus (Anthropic)', description: 'Most capable for complex tasks' },
  { value: 'anthropic/claude-3-sonnet-20250229', label: 'Claude 3 Sonnet (Anthropic)', description: 'Balanced performance and speed' },
  { value: 'meta-llama/llama-3.1-405b', label: 'Llama 3.1 405B (Meta)', description: 'Powerful open-source model' },
  { value: 'mistralai/mistral-large', label: 'Mistral Large (Mistral)', description: 'Advanced and efficient model' },
];

interface CreateProjectModalProps {
  children?: React.ReactNode;
}

export function CreateProjectModal({ children }: CreateProjectModalProps) {
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
    formState: { errors },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      description: '',
      model: 'openai/gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: 'You are a helpful AI assistant. Be professional, accurate, and concise in your responses.',
    },
  });

  const temperature = watch('temperature');
  const model = watch('model');

  const onSubmit = async (data: ProjectForm) => {
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      createProject({
        name: data.name,
        description: data.description,
        model: data.model,
        temperature: data.temperature,
        maxTokens: data.maxTokens,
        systemPrompt: data.systemPrompt,
      });
      toast({
        title: 'Project created!',
        description: `${data.name} is ready to use.`,
      });
      setOpen(false);
      reset();
    } catch {
      toast({
        title: 'Failed to create project',
        description: 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        )}
      </DialogTrigger>
      <AnimatePresence>
        {open && (
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  Create New Project
                </DialogTitle>
                <DialogDescription>
                  Set up a new AI agent with custom model and prompt configuration.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Customer Support Bot"
                      {...register('name')}
                      className={errors.name ? 'border-destructive' : ''}
                      maxLength={100}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">{errors.name.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      1-100 characters. Give your project a descriptive name.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="What does this agent do? What's its purpose?"
                      rows={2}
                      {...register('description')}
                      maxLength={500}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Optional. Max 500 characters. Helps you remember what this project is for.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>AI Model *</Label>
                    <Select
                      value={model}
                      onValueChange={(value) => setValue('model', value as AIModel)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((m) => (
                          <SelectItem key={m.value} value={m.value}>
                            <div className="flex flex-col">
                              <span>{m.label}</span>
                              <span className="text-xs text-muted-foreground">{m.description}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Temperature (0.0 - 1.0) *</Label>
                      <span className="text-lg font-semibold text-primary">
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider
                      value={[temperature]}
                      onValueChange={([value]) => setValue('temperature', value)}
                      min={0}
                      max={1}
                      step={0.1}
                      className="cursor-pointer"
                    />
                    <div className="flex justify-between gap-2">
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">0.0</span> = Deterministic (focused, consistent)
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium">1.0</span> = Creative (varied, exploratory)
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens *</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      min={256}
                      max={8192}
                      {...register('maxTokens', { valueAsNumber: true })}
                      className={errors.maxTokens ? 'border-destructive' : ''}
                    />
                    {errors.maxTokens && (
                      <p className="text-sm text-destructive">{errors.maxTokens.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Maximum length of AI responses (256-8192). Higher values allow longer responses.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt *</Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="Define your AI agent's behavior, personality, and response style. Example: 'You are a helpful customer support assistant. Be friendly, professional, and always aim to resolve issues efficiently.'"
                      rows={4}
                      {...register('systemPrompt')}
                      className={errors.systemPrompt ? 'border-destructive' : ''}
                      maxLength={4000}
                    />
                    {errors.systemPrompt && (
                      <p className="text-sm text-destructive">{errors.systemPrompt.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Required. Max 4000 characters. This defines how your AI agent behaves and responds. Be specific about tone, expertise, and guidelines.
                    </p>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4 mr-2" />
                        Create Project
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
