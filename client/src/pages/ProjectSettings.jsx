import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, RotateCcw, Bot, Sparkles, Code, MessageSquare, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useProjectsStore } from '@/store/projectsStore';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
const settingsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  model: z.enum(['openai/gpt-4-turbo', 'openai/gpt-4', 'openai/gpt-3.5-turbo', 'anthropic/claude-3-opus-20250219', 'anthropic/claude-3-sonnet-20250229', 'meta-llama/llama-3.1-405b', 'mistralai/mistral-large']),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(256).max(8192),
  systemPrompt: z.string()
});
// OpenRouter API available models
const models = [{
  value: 'openai/gpt-4-turbo',
  label: 'GPT-4 Turbo (OpenAI)'
}, {
  value: 'openai/gpt-4-32k',
  label: 'GPT-4 32K (OpenAI)'
}, {
  value: 'openai/gpt-3.5-turbo',
  label: 'GPT-3.5 Turbo (OpenAI)'
}];
const promptTemplates = [{
  id: 'customer-support',
  name: 'Customer Support Agent',
  icon: MessageSquare,
  description: 'Helpful and professional support',
  content: `You are a customer support agent for our company. Your role is to:
- Answer questions about our products and services
- Help resolve customer issues quickly and professionally
- Maintain a friendly and helpful tone at all times
- Escalate complex issues when necessary

Always start by acknowledging the customer's concern and provide clear, actionable solutions.`
}, {
  id: 'code-assistant',
  name: 'Code Assistant',
  icon: Code,
  description: 'Programming help and code review',
  content: `You are an expert programming assistant. Your role is to:
- Help debug code and identify issues
- Suggest best practices and improvements
- Explain complex concepts in simple terms
- Provide working code examples

Always consider edge cases and provide clean, well-documented code.`
}, {
  id: 'creative-writer',
  name: 'Creative Writer',
  icon: Sparkles,
  description: 'Content creation and copywriting',
  content: `You are a creative writer with expertise in various writing styles. Your role is to:
- Create engaging and original content
- Adapt your writing style to match the audience
- Suggest creative ideas and angles
- Edit and improve existing content

Be imaginative while maintaining clarity and purpose in your writing.`
}, {
  id: 'data-analyst',
  name: 'Data Analyst',
  icon: FileText,
  description: 'Data interpretation and insights',
  content: `You are a data analyst helping users understand their data. Your role is to:
- Interpret data patterns and trends
- Provide actionable insights
- Suggest visualization approaches
- Explain statistical concepts clearly

Focus on practical applications and business implications of the data.`
}];
export default function ProjectSettings() {
  const {
    projectId
  } = useParams();
  const navigate = useNavigate();
  const {
    currentProject,
    setCurrentProject,
    updateProject,
    deleteProject,
    fetchProject,
    isLoading
  } = useProjectsStore();
  const {
    toast
  } = useToast();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {
      errors,
      isDirty
    }
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: '',
      description: '',
      model: 'openai/gpt-4-turbo',
      temperature: 0.7,
      maxTokens: 2048,
      systemPrompt: ''
    }
  });
  const temperature = watch('temperature');
  const model = watch('model');
  const systemPrompt = watch('systemPrompt');
  useEffect(() => {
    if (projectId) {
      fetchProject(projectId).catch(error => {
        console.error('Failed to fetch project:', error);
        navigate('/dashboard');
      });
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
        systemPrompt: currentProject.systemPrompt || ''
      });
    }
  }, [currentProject, reset]);
  const onSubmit = async data => {
    if (projectId) {
      try {
        await updateProject(projectId, data);
        toast({
          title: 'Settings saved',
          description: 'Your project settings have been updated.'
        });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to save settings';
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive'
        });
      }
    }
  };
  const handleDelete = async () => {
    if (projectId) {
      try {
        await deleteProject(projectId);
        toast({
          title: 'Project deleted',
          description: 'Your project has been removed.'
        });
        navigate('/dashboard');
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to delete project';
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive'
        });
      }
    }
  };
  const applyTemplate = template => {
    setValue('systemPrompt', template.content, {
      shouldDirty: true
    });
    toast({
      title: 'Template applied',
      description: `${template.name} template has been applied.`
    });
  };
  if (!currentProject) {
    return null;
  }
  return <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">{currentProject.name}</h1>
                  <p className="text-sm text-muted-foreground">Project Settings</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link to={`/projects/${projectId}/chat`}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat
                </Link>
              </Button>
              <Button onClick={handleSubmit(onSubmit)} disabled={!isDirty || isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container py-8">
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="model">Model</TabsTrigger>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                  <CardDescription>
                    Basic information about your project
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Project Name</Label>
                    <Input id="name" {...register('name')} className={errors.name ? 'border-destructive' : ''} />
                    {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" {...register('description')} rows={3} placeholder="What does this project do?" />
                  </div>
                  <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
                    <span>Created {currentProject.createdAt ? format(new Date(currentProject.createdAt), 'MMMM d, yyyy') : 'Unknown'}</span>
                    <span>{currentProject.conversationCount} conversations</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Irreversible actions for this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Project
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this project?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete "{currentProject.name}" and all its
                          conversations. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="model">
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }}>
              <Card>
                <CardHeader>
                  <CardTitle>Model Configuration</CardTitle>
                  <CardDescription>
                    Customize how your AI assistant behaves
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>AI Model</Label>
                    <Select value={model} onValueChange={value => setValue('model', value, {
                    shouldDirty: true
                  })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map(m => <SelectItem key={m.value} value={m.value}>
                            {m.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Temperature</Label>
                      <span className="text-sm font-medium tabular-nums">
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <Slider value={[temperature]} onValueChange={([value]) => setValue('temperature', value, {
                    shouldDirty: true
                  })} min={0} max={1} step={0.1} />
                    <p className="text-xs text-muted-foreground">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input id="maxTokens" type="number" min={256} max={8192} {...register('maxTokens', {
                    valueAsNumber: true
                  })} />
                    <p className="text-xs text-muted-foreground">
                      Maximum response length (256-8192)
                    </p>
                  </div>

                  <Button type="button" variant="outline" onClick={() => {
                  setValue('temperature', 0.7, {
                    shouldDirty: true
                  });
                  setValue('maxTokens', 2048, {
                    shouldDirty: true
                  });
                }}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="prompts">
            <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Prompt</CardTitle>
                  <CardDescription>
                    Define your AI assistant's personality and behavior
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea {...register('systemPrompt')} rows={10} placeholder="You are a helpful assistant..." className="font-mono text-sm" />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{systemPrompt?.length || 0} / 4000 characters</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Prompt Templates</CardTitle>
                  <CardDescription>
                    Start with a pre-built template for common use cases
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {promptTemplates.map(template => <button key={template.id} onClick={() => applyTemplate(template)} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all text-left">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <template.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{template.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {template.description}
                          </p>
                        </div>
                      </button>)}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>;
}