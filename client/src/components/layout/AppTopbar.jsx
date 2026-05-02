import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Search, Plus, Settings, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useState, useRef, useEffect } from 'react';
import { CreateProjectModal } from '@/components/projects';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const TOPBAR_H = 64;

export function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { projects, currentProject, setCurrentProject } = useProjectsStore();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = path =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <>
      {/* Fixed topbar */}
      <motion.header
        initial={{ y: -TOPBAR_H, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b-2 border-primary"
        style={{ height: TOPBAR_H }}
      >
        <div className="h-full px-6 flex items-center justify-between gap-6 max-w-screen-2xl mx-auto">

          {/* Left: Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 bg-foreground flex items-center justify-center shrink-0 overflow-hidden">
              <img src="/logo.png" alt="ACS" className="w-full h-full object-contain invert"
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span class="font-mono text-[11px] font-bold text-background tracking-[0.1em] uppercase">ACS</span>'; }}
              />
            </div>
            <span className="hidden sm:block font-display text-[15px] font-black text-foreground tracking-tight uppercase">
              AI COMPANION STUDIO
            </span>
          </Link>

          {/* Center: nav + search */}
          <div className="hidden lg:flex items-center gap-6 flex-1 max-w-[600px]">
            <Link
              to="/dashboard"
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 font-mono text-[11px] font-bold tracking-[0.15em] uppercase transition-colors border-b-2",
                isActive('/dashboard') 
                  ? "text-primary border-primary" 
                  : "text-muted-foreground border-transparent hover:text-foreground"
              )}
            >
              <LayoutDashboard size={14} />
              DASHBOARD
            </Link>

            <div className="relative flex-1 max-w-[360px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                className="w-full h-9 pl-9 pr-12 rounded-none border-2 border-primary bg-background text-[12px] font-mono focus-visible:ring-0 focus-visible:border-foreground"
                placeholder="SEARCH PROJECTS..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[9px] font-bold text-muted-foreground bg-muted/20 border border-primary/20 px-1.5 py-0.5 uppercase tracking-[0.1em]">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: new project + user */}
          <div className="flex items-center gap-4">

            {/* New project */}
            <div className="hidden md:block">
              <CreateProjectModal>
                <Button className="h-9 px-4 rounded-none border-2 border-primary bg-primary text-background hover:bg-foreground font-mono text-[11px] font-bold tracking-[0.1em] uppercase gap-2 whitespace-nowrap">
                  <Plus size={14} />
                  NEW PROJECT
                </Button>
              </CreateProjectModal>
            </div>

            {/* User menu */}
            <div ref={userMenuRef} className="relative">
              <button 
                className="flex items-center gap-2 p-1 border-2 border-transparent hover:border-primary transition-colors focus:outline-none" 
                onClick={() => setUserMenuOpen(v => !v)}
              >
                <div className="w-8 h-8 bg-primary flex items-center justify-center shrink-0">
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    : <span className="font-mono text-[12px] font-bold text-background uppercase">{initials}</span>
                  }
                </div>
                <ChevronDown size={14} className="text-muted-foreground hidden sm:block" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-[calc(100%+8px)] w-[240px] bg-background border-2 border-primary z-[100]"
                  >
                    <div className="p-4 border-b-2 border-primary bg-muted/10">
                      <div className="font-mono text-[12px] font-bold text-foreground mb-1 uppercase tracking-[0.05em] truncate">
                        {user?.name || 'USER'}
                      </div>
                      <div className="font-mono text-[10px] text-muted-foreground tracking-[0.05em] uppercase truncate">
                        {user?.email || ''}
                      </div>
                    </div>

                    <div className="p-2">
                      <Link 
                        to="/profile" 
                        className="flex items-center gap-3 w-full p-3 font-mono text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors" 
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User size={14} />
                        PROFILE
                      </Link>
                      <Link 
                        to="/settings/security" 
                        className="flex items-center gap-3 w-full p-3 font-mono text-[11px] font-bold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors" 
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings size={14} />
                        SETTINGS
                      </Link>
                    </div>

                    <div className="p-2 border-t-2 border-primary">
                      <button 
                        className="flex items-center gap-3 w-full p-3 font-mono text-[11px] font-bold tracking-[0.1em] uppercase text-destructive hover:bg-destructive/10 transition-colors text-left" 
                        onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      >
                        <LogOut size={14} />
                        LOGOUT
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden flex items-center justify-center w-10 h-10 border-2 border-primary text-foreground hover:bg-muted/20 transition-colors"
              onClick={() => setMobileOpen(v => !v)}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[49]"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 top-0 bottom-0 w-[300px] bg-background border-l-2 border-primary flex flex-col pt-[64px]"
            >
              {/* User info */}
              <div className="p-6 border-b-2 border-primary bg-muted/10">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-10 h-10 bg-primary flex items-center justify-center shrink-0">
                    {user?.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      : <span className="font-mono text-[14px] font-bold text-background uppercase">{initials}</span>
                    }
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-mono text-[12px] font-bold text-foreground uppercase tracking-[0.05em] truncate">{user?.name || 'USER'}</div>
                    <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.05em] truncate">{user?.email || ''}</div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                <Link
                  to="/dashboard"
                  className={cn(
                    "flex items-center gap-3 p-4 font-mono text-[11px] font-bold tracking-[0.15em] uppercase transition-colors border-l-2",
                    isActive('/dashboard')
                      ? "text-primary bg-primary/10 border-primary"
                      : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/20"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard size={16} />
                  DASHBOARD
                </Link>
                
                <div className="my-2 border-t-2 border-primary/20" />
                
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 p-4 font-mono text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground border-l-2 border-transparent hover:text-foreground hover:bg-muted/20 transition-colors" 
                  onClick={() => setMobileOpen(false)}
                >
                  <User size={16} />
                  PROFILE
                </Link>
                <Link 
                  to="/settings/security" 
                  className="flex items-center gap-3 p-4 font-mono text-[11px] font-bold tracking-[0.15em] uppercase text-muted-foreground border-l-2 border-transparent hover:text-foreground hover:bg-muted/20 transition-colors" 
                  onClick={() => setMobileOpen(false)}
                >
                  <Settings size={16} />
                  SETTINGS
                </Link>
                
                <div className="mt-auto pt-4 border-t-2 border-primary/20">
                  <button 
                    className="flex items-center gap-3 w-full p-4 font-mono text-[11px] font-bold tracking-[0.15em] uppercase text-destructive border-l-2 border-transparent hover:bg-destructive/10 transition-colors text-left" 
                    onClick={() => { handleLogout(); setMobileOpen(false); }}
                  >
                    <LogOut size={16} />
                    LOGOUT
                  </button>
                </div>
              </nav>

              {/* New project */}
              <div className="p-6 border-t-2 border-primary bg-muted/5">
                <CreateProjectModal>
                  <Button className="w-full h-12 rounded-none border-2 border-primary bg-primary text-background hover:bg-foreground font-mono text-[12px] font-bold tracking-[0.1em] uppercase gap-2">
                    <Plus size={16} />
                    NEW PROJECT
                  </Button>
                </CreateProjectModal>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
