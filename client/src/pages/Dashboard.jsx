import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutGrid, List, Plus, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectCard, CreateProjectModal } from '@/components/projects';
import { useProjectsStore } from '@/store/projectsStore';
import { useAuthStore } from '@/store/authStore';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { cn } from '@/lib/utils';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  borderBright: '#352C1C',
  accent: '#E8961E',
  accentDark: '#9A5E0A',
  text: '#F0E8D8',
  muted: '#7A6A54',
  green: '#4ADE80',
  red: '#FF5C5C',
};

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
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;1,9..144,300;1,9..144,400&family=JetBrains+Mono:wght@400;500;600&display=swap';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        console.log('🔄 [Dashboard] Fetching projects (refreshKey:', refreshKey, ')...');
        await fetchProjects();
        console.log('✅ [Dashboard] Projects fetched successfully');
      } catch (err) {
        console.error('❌ [Dashboard] Failed to load projects:', err);
        handleError(err, 'Failed to load projects');
      }
    };
    load();
  }, [refreshKey, fetchProjects, handleError]);

  const handleProjectCreated = () => {
    console.log('✅ [Dashboard] Project created, refreshing list...');
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
  const quotaRemaining = user?.chatLimit ? user.chatLimit - (user.chatUsageCount || 0) : '∞';
  const quotaLow = user?.chatLimit && Number(quotaRemaining) < 10;

  const stats = [
    { label: 'ACTIVE PROJECTS', value: activeProjects, status: 'OPERATIONAL', dot: DB.green },
    { label: 'CONVERSATIONS', value: totalConversations, status: 'LOGGED', dot: DB.green },
    { label: 'QUOTA REMAINING', value: quotaRemaining, status: quotaLow ? 'WARNING' : 'NOMINAL', dot: quotaLow ? DB.red : DB.green },
  ];

  if (error && projects.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`.db-mono{font-family:'JetBrains Mono',monospace}`}</style>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ width: 56, height: 56, border: `2px solid ${DB.red}`, margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertCircle size={22} color={DB.red} />
          </div>
          <p className="db-mono" style={{ fontSize: 10, color: DB.red, letterSpacing: '0.25em', marginBottom: 8 }}>SYSTEM ERROR</p>
          <p className="db-mono" style={{ fontSize: 12, color: DB.muted, marginBottom: 28 }}>{error.message}</p>
          <button
            onClick={() => { clearError(); setRefreshKey(p => p + 1); }}
            className="db-mono"
            style={{ border: `1px solid ${DB.accent}`, color: DB.accent, backgroundColor: 'transparent', padding: '10px 28px', fontSize: 10, letterSpacing: '0.2em', cursor: 'pointer' }}
          >
            RETRY ↺
          </button>
        </motion.div>
      </div>
    );
  }

  if (isLoading && projects.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: DB.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{`.db-mono{font-family:'JetBrains Mono',monospace}`}</style>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center' }}>
          <motion.div
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: DB.accent, margin: '0 auto 20px' }}
          />
          <p className="db-mono" style={{ fontSize: 10, color: DB.muted, letterSpacing: '0.25em' }}>LOADING WORKSPACE...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: DB.bg, color: DB.text }}>
      <style>{`
        .db-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .db-serif { font-family: 'Fraunces', Georgia, serif; }
        .db-pulse { animation: dbpulse 2.2s ease-in-out infinite; }
        @keyframes dbpulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
        .db-search { background:${DB.surface}; border:1px solid ${DB.border}; color:${DB.text}; outline:none; width:100%; padding:8px 12px 8px 32px; font-size:11px; letter-spacing:0.05em; }
        .db-search::placeholder { color:${DB.muted}; }
        .db-search:focus { border-color:${DB.accent}; }
        .db-view-btn { background:transparent; border:none; cursor:pointer; width:34px; height:34px; display:flex; align-items:center; justify-content:center; transition:color 0.12s,background 0.12s; }
        .db-view-btn:hover { color:${DB.text} !important; }
        .db-new-btn:hover { background-color:#C87A12 !important; }
        .db-stat:not(:last-child) { border-right:1px solid ${DB.border}; }
        .db-sort [data-radix-select-trigger] { border-radius:0 !important; }
      `}</style>

      {/* Grain overlay */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.028,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '220px 220px',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* SYSTEM BAR */}
        <div style={{ borderBottom: `1px solid ${DB.border}`, backgroundColor: DB.surface, padding: '7px 24px sm:32px' }}>
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 sm:px-8">
            <div className="db-mono flex items-center gap-4 sm:gap-6" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.2em' }}>
              <span className="hidden sm:inline">ACS WORKSPACE v1.0</span>
              <span className="hidden sm:inline" style={{ color: DB.border }}>·</span>
              <span><LiveClock /></span>
              <span style={{ color: DB.border }}>·</span>
              <span className="flex items-center gap-1.5">
                <span className="db-pulse inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: DB.green }} />
                OPERATIONAL
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="db-mono hidden sm:block" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.12em' }}>
                {user?.email}
              </span>
              <div
                className="db-mono"
                style={{
                  width: 28, height: 28, borderRadius: '50%', backgroundColor: DB.accentDark,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, color: DB.accent, fontWeight: 600, border: `1px solid ${DB.accent}40`,
                }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 sm:px-8">

          {/* HEADER */}
          <div style={{ borderBottom: `1px solid ${DB.border}`, padding: '36px 0 32px' }}>
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="db-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.3em', marginBottom: 10 }}>
                WORKSPACE · USER SESSION
              </p>
              <h1
                className="db-serif"
                style={{ fontSize: 'clamp(34px, 5vw, 58px)', fontWeight: 300, fontStyle: 'italic', lineHeight: 1.05, color: DB.text }}
              >
                {getGreeting()},&nbsp;
                <span style={{ color: DB.accent }}>{user?.name?.split(' ')[0] || 'there'}.</span>
              </h1>
            </motion.div>
          </div>

          {/* STATS */}
          <div style={{ borderBottom: `1px solid ${DB.border}`, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.12 + i * 0.08 }}
                className="db-stat"
                style={{ padding: 'clamp(18px, 3vw, 28px) 0 clamp(18px, 3vw, 28px) 0' }}
              >
                <p className="db-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.22em', marginBottom: 10 }}>
                  {s.label}
                </p>
                <div
                  className="db-mono"
                  style={{ fontSize: 'clamp(36px, 5vw, 58px)', color: DB.accent, lineHeight: 1, fontWeight: 500, marginBottom: 10 }}
                >
                  {s.value}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span className="db-pulse inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                  <span className="db-mono" style={{ fontSize: 8, color: DB.muted, letterSpacing: '0.2em' }}>{s.status}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* TOOLBAR */}
          <div
            style={{ borderBottom: `1px solid ${DB.border}`, padding: '14px 0', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}
          >
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: DB.muted, pointerEvents: 'none' }} />
              <input
                className="db-mono db-search"
                placeholder="search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="db-sort">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger
                  className="db-mono rounded-none h-[34px] w-[130px] text-[10px] tracking-widest"
                  style={{ backgroundColor: DB.surface, borderColor: DB.border, color: DB.muted, borderRadius: 0, fontFamily: "'JetBrains Mono', monospace" }}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  style={{ backgroundColor: DB.surface, borderColor: DB.border, borderRadius: 0 }}
                >
                  <SelectItem value="recent" className="db-mono" style={{ fontSize: 10, color: DB.text }}>RECENT</SelectItem>
                  <SelectItem value="name" className="db-mono" style={{ fontSize: 10, color: DB.text }}>NAME A–Z</SelectItem>
                  <SelectItem value="created" className="db-mono" style={{ fontSize: 10, color: DB.text }}>CREATED</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View toggle */}
            <div style={{ display: 'flex', border: `1px solid ${DB.border}` }}>
              {[{ mode: 'grid', Icon: LayoutGrid }, { mode: 'list', Icon: List }].map(({ mode, Icon }) => (
                <button
                  key={mode}
                  className="db-view-btn"
                  onClick={() => setViewMode(mode)}
                  style={{
                    color: viewMode === mode ? DB.accent : DB.muted,
                    backgroundColor: viewMode === mode ? DB.borderBright : 'transparent',
                    borderRight: mode === 'grid' ? `1px solid ${DB.border}` : 'none',
                  }}
                >
                  <Icon size={13} />
                </button>
              ))}
            </div>

            {/* New project */}
            <CreateProjectModal onSuccess={handleProjectCreated}>
              <button
                className="db-mono db-new-btn flex items-center gap-1.5"
                style={{
                  backgroundColor: DB.accent, color: '#0E0C0A', border: 'none',
                  padding: '0 16px', height: 34, fontSize: 10, letterSpacing: '0.18em',
                  fontWeight: 600, cursor: 'pointer', transition: 'background-color 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={11} />
                <span className="hidden sm:inline">NEW PROJECT</span>
                <span className="sm:hidden">NEW</span>
              </button>
            </CreateProjectModal>
          </div>

          {/* PROJECT GRID */}
          <div style={{ padding: '28px 0 48px' }}>
            <AnimatePresence mode="wait">
              {filteredProjects.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ padding: '72px 0', textAlign: 'center' }}
                >
                  <div
                    style={{
                      width: 60, height: 60, border: `1px solid ${DB.border}`,
                      margin: '0 auto 22px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <img src="/logo.png" alt="" style={{ width: 34, height: 34, objectFit: 'contain', opacity: 0.35 }} />
                  </div>
                  <p className="db-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.25em', marginBottom: 10 }}>
                    {searchQuery ? 'NO RESULTS FOUND' : 'NO PROJECTS YET'}
                  </p>
                  <p
                    className="db-serif"
                    style={{ fontSize: 22, fontStyle: 'italic', color: DB.text, marginBottom: 28, fontWeight: 300 }}
                  >
                    {searchQuery ? 'Adjust your search query.' : 'Create your first AI companion.'}
                  </p>
                  {!searchQuery && (
                    <CreateProjectModal onSuccess={handleProjectCreated}>
                      <button
                        className="db-mono db-new-btn inline-flex items-center gap-2"
                        style={{
                          backgroundColor: DB.accent, color: '#0E0C0A', border: 'none',
                          padding: '12px 28px', fontSize: 10, letterSpacing: '0.18em',
                          fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        <Plus size={12} />
                        NEW PROJECT
                      </button>
                    </CreateProjectModal>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={cn(
                    'grid gap-5',
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
      </div>
    </div>
  );
}
