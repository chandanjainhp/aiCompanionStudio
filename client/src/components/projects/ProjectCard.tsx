import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Settings, Trash2, MoreVertical, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useProjectsStore } from '@/store/projectsStore';
import { useToast } from '@/hooks/use-toast';
import type { Project } from '@/types';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const modelColors: Record<string, string> = {
  'openai/gpt-4-turbo': 'bg-cyan-500/10 text-cyan-500',
  'openai/gpt-4': 'bg-cyan-500/10 text-cyan-500',
  'openai/gpt-3.5-turbo': 'bg-cyan-400/10 text-cyan-400',
  'anthropic/claude-3-opus-20250219': 'bg-purple-500/10 text-purple-500',
  'anthropic/claude-3-sonnet-20250229': 'bg-purple-400/10 text-purple-400',
  'meta-llama/llama-3.1-405b': 'bg-red-500/10 text-red-500',
  'mistralai/mistral-large': 'bg-orange-500/10 text-orange-500',
};

export function ProjectCard({ project, index }: ProjectCardProps) {
  const navigate = useNavigate();
  const { deleteProject, setCurrentProject } = useProjectsStore();
  const { toast } = useToast();

  const handleOpen = () => {
    setCurrentProject(project);
    navigate(`/projects/${project.id}/chat`);
  };

  const handleSettings = () => {
    setCurrentProject(project);
    navigate(`/projects/${project.id}/settings`);
  };

  const handleDelete = () => {
    deleteProject(project.id);
    toast({
      title: 'Project deleted',
      description: `${project.name} has been removed.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="group hover:shadow-medium transition-all duration-300 hover:border-primary/50 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3" onClick={handleOpen}>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {project.name}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 break-words">
                  {project.description || 'No description'}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleOpen}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSettings}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{project.name}" and all its conversations.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-3" onClick={handleOpen}>
          <Badge className={modelColors[project.model] || 'bg-muted text-muted-foreground'}>
            {project.model}
          </Badge>
        </CardContent>
        <CardFooter className="pt-0 text-xs text-muted-foreground" onClick={handleOpen}>
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />
              {project.conversationCount} conversations
            </span>
            <span>Updated {format(new Date(project.updatedAt), 'MMM d, yyyy')}</span>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
