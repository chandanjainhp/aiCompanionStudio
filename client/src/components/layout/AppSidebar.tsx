import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Plus, 
  Settings, 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  LayoutDashboard,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { projects, setCurrentProject } = useProjectsStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleProjectClick = (project: typeof projects[0]) => {
    setCurrentProject(project);
    navigate(`/projects/${project.id}/chat`);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isProjectActive = (id: string) => location.pathname.includes(`/projects/${id}`);

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 64 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-semibold text-lg text-sidebar-foreground"
            >
              ChatForge
            </motion.span>
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>
      </div>

      {/* New Project Button */}
      <div className="p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => navigate('/dashboard')}
              className={cn(
                "w-full gap-2 bg-primary hover:bg-primary/90",
                !sidebarOpen && "px-0"
              )}
            >
              <Plus className="w-4 h-4" />
              {sidebarOpen && "New Project"}
            </Button>
          </TooltipTrigger>
          {!sidebarOpen && <TooltipContent side="right">New Project</TooltipContent>}
        </Tooltip>
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground",
                  !sidebarOpen && "justify-center px-0"
                )}
              >
                <LayoutDashboard className="w-4 h-4" />
                {sidebarOpen && "Dashboard"}
              </Button>
            </Link>
          </TooltipTrigger>
          {!sidebarOpen && <TooltipContent side="right">Dashboard</TooltipContent>}
        </Tooltip>
      </nav>

      <Separator className="my-3 bg-sidebar-border" />

      {/* Projects List */}
      <div className="flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="px-4 py-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Projects
            </p>
          </div>
        )}
        <ScrollArea className="h-full px-3 pb-4">
          <div className="space-y-1">
            {projects.map((project) => (
              <Tooltip key={project.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleProjectClick(project)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors",
                      "hover:bg-sidebar-accent text-sidebar-foreground",
                      isProjectActive(project.id) && "bg-sidebar-accent",
                      !sidebarOpen && "justify-center px-0"
                    )}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0" />
                    {sidebarOpen && (
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{project.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {project.conversationCount} chats
                        </p>
                      </div>
                    )}
                  </button>
                </TooltipTrigger>
                {!sidebarOpen && <TooltipContent side="right">{project.name}</TooltipContent>}
              </Tooltip>
            ))}
          </div>
        </ScrollArea>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* User Section */}
      <div className="p-3 space-y-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/profile">
              <Button
                variant={isActive('/profile') ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground",
                  !sidebarOpen && "justify-center px-0"
                )}
              >
                <User className="w-4 h-4" />
                {sidebarOpen && "Profile"}
              </Button>
            </Link>
          </TooltipTrigger>
          {!sidebarOpen && <TooltipContent side="right">Profile</TooltipContent>}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/settings/security">
              <Button
                variant={isActive('/settings') ? 'secondary' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground",
                  !sidebarOpen && "justify-center px-0"
                )}
              >
                <Settings className="w-4 h-4" />
                {sidebarOpen && "Settings"}
              </Button>
            </Link>
          </TooltipTrigger>
          {!sidebarOpen && <TooltipContent side="right">Settings</TooltipContent>}
        </Tooltip>

        <Separator className="my-2 bg-sidebar-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <div 
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg",
                sidebarOpen ? "" : "justify-center"
              )}
            >
              <UserAvatar
                avatarUrl={user?.avatarUrl}
                name={user?.name}
                size="md"
              />
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-sidebar-foreground">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              )}
            </div>
          </TooltipTrigger>
          {!sidebarOpen && <TooltipContent side="right">{user?.name || 'User'}</TooltipContent>}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                "w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <LogOut className="w-4 h-4" />
              {sidebarOpen && "Logout"}
            </Button>
          </TooltipTrigger>
          {!sidebarOpen && <TooltipContent side="right">Logout</TooltipContent>}
        </Tooltip>
      </div>
    </motion.aside>
  );
}
