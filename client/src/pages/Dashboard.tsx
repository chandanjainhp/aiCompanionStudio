import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, LayoutGrid, List, Plus, Bot, AlertCircle } from 'lucide-react';
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
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { cn } from '@/lib/utils';

type SortOption = 'recent' | 'name' | 'created';
type ViewMode = 'grid' | 'list';

export default function Dashboard() {
  const { projects, fetchProjects, isLoading } = useProjectsStore();
  const { error, handleError, clearError } = useErrorHandler();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Trigger refresh when projects are created

  useEffect(() => {
    // Fetch projects when component mounts or refresh is triggered
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

  // Callback to refresh projects after creation
  const handleProjectCreated = () => {
    console.log('🔄 [Dashboard] Project created, refreshing list...');
    // Force refresh by incrementing key
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

  // Show error state if projects fail to load
  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-destructive/10">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold">Failed to load projects</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={() => { clearError(); setHasAttemptedFetch(false); }} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching
  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center">
            <div className="animate-spin">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Projects</h1>
              <p className="text-muted-foreground text-sm">
                Manage your AI agents and chatbots
              </p>
            </div>
            <CreateProjectModal onSuccess={handleProjectCreated}>
              <Button className="gap-2 shadow-glow">
                <Plus className="w-4 h-4" />
                New Project
              </Button>
            </CreateProjectModal>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container py-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recent</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex border rounded-lg overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-none h-9 w-9',
                  viewMode === 'grid' && 'bg-muted'
                )}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'rounded-none h-9 w-9',
                  viewMode === 'list' && 'bg-muted'
                )}
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Projects Grid/List */}
        {filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-6">
              <Bot className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? 'No projects found' : 'Create your first project'}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {searchQuery
                ? 'Try adjusting your search terms'
                : 'Get started by creating an AI agent with custom prompts and settings'}
            </p>
            {!searchQuery && (
              <CreateProjectModal onSuccess={handleProjectCreated}>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Project
                </Button>
              </CreateProjectModal>
            )}
          </motion.div>
        ) : (
          <div
            className={cn(
              'grid gap-4',
              viewMode === 'grid'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : 'grid-cols-1'
            )}
          >
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
