import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import AddIcon from '@mui/icons-material/Add';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import BoltIcon from '@mui/icons-material/Bolt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProjectCard, CreateProjectModal } from '@/components/projects';
import { useProjectsStore } from '@/store/projectsStore';
import { useAuthStore } from '@/store/authStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { cn } from '@/lib/utils';

type SortOption = 'recent' | 'name' | 'created';
type ViewMode = 'grid' | 'list';

export default function Dashboard() {
  const { projects, fetchProjects, isLoading } = useProjectsStore();
  const { user } = useAuthStore();
  const { error, handleError, clearError } = useErrorHandler();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        console.log('📦 [Dashboard] Fetching projects (refreshKey:', refreshKey, ')...');
        await fetchProjects();
        console.log('✅ [Dashboard] Projects fetched successfully');
      } catch (err) {
        console.error('❌ [Dashboard] Failed to load projects:', err);
        handleError(err, 'Failed to load projects');
      }
    };

    loadProjects();
  }, [refreshKey, fetchProjects, handleError]);

  const handleProjectCreated = () => {
    console.log('🔄 [Dashboard] Project created, refreshing list...');
    setRefreshKey(prev => prev + 1);
  };

  const filteredProjects = projects
    .filter((project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        case 'recent':
        default:
          return (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
      }
    });

  // Calculate stats
  const totalConversations = projects.reduce((sum, p) => sum + (p.conversationCount || 0), 0);
  const activeProjects = projects.length;

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Show error state
  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
            <ErrorOutlineIcon sx={{ fontSize: 32 }} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white">Failed to load projects</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => { clearError(); setRefreshKey(prev => prev + 1); }} className="bg-gradient-to-r from-blue-600 to-cyan-500">
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // Show loading state
  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F1A]">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center space-y-4"
        >
          <div className="inline-flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center"
            >
              <img src="/logo.png" alt="Loading" className="w-full h-full object-contain" />
            </motion.div>
          </div>
          <p className="text-muted-foreground">Loading your workspace...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0F1A]">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-white/10">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-500/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />

        <div className="relative container py-12">
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p className="text-muted-foreground/70 text-lg">
              Welcome to your AI workspace
            </p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative group"
            >
              <div className="absolute -inset-[1px] bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-blue-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center">
                    <AutoAwesomeIcon sx={{ fontSize: 20 }} className="text-white" />
                  </div>
                  <TrendingUpIcon sx={{ fontSize: 16 }} className="text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{activeProjects}</p>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">Active Projects</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative group"
            >
              <div className="absolute -inset-[1px] bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center">
                    <ChatBubbleOutlineIcon sx={{ fontSize: 20 }} className="text-white" />
                  </div>
                  <TrendingUpIcon sx={{ fontSize: 16 }} className="text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">{totalConversations}</p>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">Total Chats</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group"
            >
              <div className="absolute -inset-[1px] bg-gradient-to-br from-orange-500/20 via-yellow-500/20 to-orange-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-600 to-yellow-500 flex items-center justify-center">
                    <BoltIcon sx={{ fontSize: 20 }} className="text-white" />
                  </div>
                  <TrendingUpIcon sx={{ fontSize: 16 }} className="text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-1">∞</p>
                <p className="text-xs text-muted-foreground/60 uppercase tracking-wider font-medium">API Calls</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-md w-full">
            <SearchIcon sx={{ fontSize: 16 }} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 bg-white/5 border-white/10 focus:border-blue-500/50 focus:bg-white/[0.07] transition-all h-11 rounded-xl backdrop-blur-sm"
            />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px] bg-white/5 border-white/10 rounded-xl h-11 backdrop-blur-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-[#0B0F1A]/95 backdrop-blur-xl border-white/10">
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex border border-white/10 rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-none h-11 w-11 hover:bg-white/10',
                  viewMode === 'grid' && 'bg-white/10'
                )}
                onClick={() => setViewMode('grid')}
              >
                <GridViewIcon sx={{ fontSize: 16 }} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-none h-11 w-11 hover:bg-white/10',
                  viewMode === 'list' && 'bg-white/10'
                )}
                onClick={() => setViewMode('list')}
              >
                <ViewListIcon sx={{ fontSize: 16 }} />
              </Button>
            </div>

            <CreateProjectModal onSuccess={handleProjectCreated}>
              <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 h-11 px-6 rounded-xl font-semibold">
                <AddIcon sx={{ fontSize: 16 }} />
                New Project
              </Button>
            </CreateProjectModal>
          </div>
        </div>

        {/* Projects Grid/List */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 p-4">
                <img src="/logo.png" alt="No projects" className="w-full h-full object-contain opacity-50" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {searchQuery ? 'No projects found' : 'Create your first project'}
              </h2>
              <p className="text-muted-foreground/70 mb-8 max-w-md">
                {searchQuery
                  ? 'Try adjusting your search terms'
                  : 'Get started by creating an AI agent with custom prompts and settings'}
              </p>
              {!searchQuery && (
                <CreateProjectModal onSuccess={handleProjectCreated}>
                  <Button className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 h-11 px-6 rounded-xl font-semibold">
                    <AddIcon sx={{ fontSize: 16 }} />
                    New Project
                  </Button>
                </CreateProjectModal>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'grid gap-6',
                viewMode === 'grid'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              )}
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
