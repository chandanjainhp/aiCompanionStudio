import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, Plus, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCard, CreateProjectModal } from '@/components/projects';
import { useProjectsStore } from '@/store/projectsStore';
import { useAuthStore } from '@/store/authStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return <>{time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</>;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const { projects, fetchProjects, isLoading } = useProjectsStore();
  const { user } = useAuthStore();
  const { error, handleError, clearError } = useErrorHandler();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        await fetchProjects();
      } catch (err) {
        handleError(err, 'Failed to load projects');
      }
    };
    load();
  }, [refreshKey, fetchProjects, handleError]);

  const handleProjectCreated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const filteredProjects = projects
    .filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'created':
          return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
        default:
          return (b.updatedAt ? new Date(b.updatedAt).getTime() : 0) - (a.updatedAt ? new Date(a.updatedAt).getTime() : 0);
      }
    });

  const totalConversations = projects.reduce((sum, p) => sum + (p.conversationCount || 0), 0);
  const activeProjects = projects.length;
  const quotaRemaining = user?.chatLimit ? user.chatLimit - (user.chatUsageCount || 0) : 'INF';
  const quotaLow = user?.chatLimit && Number(quotaRemaining) < 10;

  const stats = [
    { label: 'ACTIVE PROJECTS', value: activeProjects, status: 'OPERATIONAL' },
    { label: 'CONVERSATIONS', value: totalConversations, status: 'LOGGED' },
    { label: 'QUOTA REMAINING', value: quotaRemaining, status: quotaLow ? 'WARNING' : 'NOMINAL' },
  ];

  if (error && projects.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <AlertCircle size={32} className="text-primary mb-4" />
        <p className="kicker">SYSTEM ERROR</p>
        <p className="font-body text-[16px] text-foreground mb-6">{error.message}</p>
        <Button onClick={() => { clearError(); setRefreshKey(p => p + 1); }}>RETRY</Button>
      </div>
    );
  }

  if (isLoading && projects.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <p className="kicker">LOADING WORKSPACE...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* SYSTEM BAR */}
      <div className="border-b-2 border-primary bg-background py-2">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between px-6">
          <div className="font-mono uppercase tracking-[1.2px] text-[11px] font-bold text-foreground flex gap-4">
            <span className="hidden sm:inline">ACS WORKSPACE</span>
            <span><LiveClock /></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono uppercase tracking-[1.2px] text-[11px] font-bold text-foreground">
              {user?.email}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6">
        {/* HEADER */}
        <div className="py-12 border-b border-border">
          <p className="kicker">WORKSPACE · USER SESSION</p>
          <h1 className="headline-hero">
            {getGreeting()}, <span className="text-accent">{user?.name?.split(' ')[0] || 'there'}</span>.
          </h1>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-border">
          {stats.map((s, i) => (
            <div key={s.label} className={cn("py-8", i !== 2 && "sm:border-r sm:border-border sm:pr-8")}>
              <p className="kicker">{s.label}</p>
              <div className="font-display text-[48px] leading-[0.93] text-primary">{s.value}</div>
              <div className="font-mono uppercase tracking-[1.2px] text-[11px] text-muted mt-2">{s.status}</div>
            </div>
          ))}
        </div>

        {/* TOOLBAR */}
        <div className="py-6 border-b border-border flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              className="w-full h-[40px] pl-9 pr-3 border-2 border-primary font-sans text-[14px] bg-background text-foreground placeholder:text-muted focus:outline-none"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="w-[140px]">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-[40px] border-2 border-primary rounded-none font-sans font-bold text-[14px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-none border-2 border-primary">
                <SelectItem value="recent" className="font-sans font-bold text-[14px]">RECENT</SelectItem>
                <SelectItem value="name" className="font-sans font-bold text-[14px]">NAME A-Z</SelectItem>
                <SelectItem value="created" className="font-sans font-bold text-[14px]">CREATED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <CreateProjectModal onSuccess={handleProjectCreated}>
            <Button className="h-[40px]">NEW PROJECT</Button>
          </CreateProjectModal>
        </div>

        {/* PROJECT GRID */}
        <div className="py-12">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <p className="kicker">{searchQuery ? 'NO RESULTS FOUND' : 'NO PROJECTS YET'}</p>
              <p className="font-body text-[19px] mb-8">{searchQuery ? 'Adjust your search query.' : 'Create your first AI companion.'}</p>
              {!searchQuery && (
                <CreateProjectModal onSuccess={handleProjectCreated}>
                  <Button>CREATE PROJECT</Button>
                </CreateProjectModal>
              )}
            </div>
          ) : (
            <div className={cn("grid gap-8", viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1")}>
              {filteredProjects.map((project, index) => (
                <div key={project.id}>
                  <ProjectCard project={project} index={index} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
