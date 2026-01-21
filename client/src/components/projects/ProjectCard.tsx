import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Settings, Trash2, MoreVertical, Sparkles, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { format, formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  index: number;
}

const modelColors: Record<string, string> = {
  'openai/gpt-4-turbo': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'openai/gpt-4': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  'openai/gpt-3.5-turbo': 'bg-cyan-400/10 text-cyan-300 border-cyan-400/20',
  'anthropic/claude-3-opus-20250219': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'anthropic/claude-3-sonnet-20250229': 'bg-purple-400/10 text-purple-300 border-purple-400/20',
  'meta-llama/llama-3.1-405b': 'bg-red-500/10 text-red-400 border-red-500/20',
  'mistralai/mistral-large': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
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
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.23, 1, 0.32, 1] }}
      className="group relative"
    >
      {/* Gradient border effect on hover */}
      <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/0 via-cyan-500/0 to-blue-500/0 group-hover:from-blue-500/20 group-hover:via-cyan-500/20 group-hover:to-blue-500/20 rounded-2xl transition-all duration-500 opacity-0 group-hover:opacity-100 blur-sm" />

      <div
        className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 group-hover:bg-white/[0.07] group-hover:border-white/20 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1 cursor-pointer"
        onClick={handleOpen}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Project Icon */}
              <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-white/5 p-2">
                <img src="/logo.png" alt={project.name} className="w-full h-full object-contain" />
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-base text-white truncate group-hover:text-blue-300 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-0.5">
                  {project.description || 'No description'}
                </p>
              </div>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-white/10"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0B0F1A]/95 backdrop-blur-xl border-white/10">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleOpen(); }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Open Chat
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSettings(); }}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-400 focus:text-red-400 focus:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-[#0B0F1A] border-white/10">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete project?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete "{project.name}" and all its conversations.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-white/5 border-white/10 hover:bg-white/10">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-red-600 text-white hover:bg-red-700"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Model Badge */}
          <Badge
            variant="outline"
            className={`${modelColors[project.model] || 'bg-white/5 text-muted-foreground border-white/10'} text-[10px] font-mono px-2 py-0.5`}
          >
            {project.model}
          </Badge>
        </div>

        {/* Footer Stats */}
        <div className="px-6 py-4 border-t border-white/5 bg-black/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground/70">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="font-medium">{project.conversationCount}</span>
            <span className="text-muted-foreground/50">chats</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground/50">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px]">
              {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
