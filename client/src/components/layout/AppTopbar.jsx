import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Search, Plus, Settings, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { useState, useRef, useEffect } from 'react';
import { CreateProjectModal } from '@/components/projects';

const DB = {
  bg: '#0E0C0A',
  surface: '#161210',
  border: '#252018',
  borderBright: '#352C1C',
  accent: '#E8961E',
  accentFaint: 'rgba(232,150,30,0.08)',
  accentDark: '#9A5E0A',
  text: '#F0E8D8',
  muted: '#7A6A54',
  red: '#FF5C5C',
};

const TOPBAR_H = 56;

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
      <style>{`
        .tb-mono { font-family: 'JetBrains Mono', 'Courier New', monospace; }
        .tb-nav-link { background: transparent; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 10px; font-family: 'JetBrains Mono', monospace; font-size: 9px; letter-spacing: 0.18em; color: ${DB.muted}; transition: color 0.15s; text-decoration: none; }
        .tb-nav-link:hover { color: ${DB.text}; }
        .tb-nav-link.active { color: ${DB.accent}; border-bottom: 1px solid ${DB.accent}; }
        .tb-search { background: ${DB.surface}; border: 1px solid ${DB.border}; color: ${DB.text}; outline: none; padding: 6px 32px 6px 30px; font-size: 11px; font-family: 'JetBrains Mono', monospace; width: 100%; transition: border-color 0.15s; }
        .tb-search::placeholder { color: ${DB.muted}; }
        .tb-search:focus { border-color: ${DB.borderBright}; }
        .tb-new-btn { background: ${DB.accent}; color: #0E0C0A; border: none; padding: 6px 12px; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; cursor: pointer; transition: background 0.15s; font-family: 'JetBrains Mono', monospace; display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
        .tb-new-btn:hover { background: ${DB.accentDark}; }
        .tb-user-btn { background: transparent; border: 1px solid ${DB.border}; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 4px 8px 4px 4px; transition: border-color 0.15s; }
        .tb-user-btn:hover { border-color: ${DB.borderBright}; }
        .tb-menu-item { display: flex; align-items: center; gap: 8px; width: 100%; background: transparent; border: none; cursor: pointer; padding: 9px 14px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: ${DB.muted}; transition: all 0.12s; text-align: left; text-decoration: none; }
        .tb-menu-item:hover { color: ${DB.text}; background: rgba(255,255,255,0.03); }
        .tb-menu-item.danger { color: ${DB.red}; }
        .tb-menu-item.danger:hover { color: ${DB.red}; background: rgba(255,92,92,0.08); }
        .tb-mob-item { display: flex; align-items: center; gap: 10px; width: 100%; background: transparent; border: none; cursor: pointer; padding: 12px 16px; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.15em; color: ${DB.muted}; transition: all 0.12s; text-align: left; text-decoration: none; }
        .tb-mob-item:hover { color: ${DB.text}; background: rgba(255,255,255,0.03); }
        .tb-mob-item.active { color: ${DB.accent}; border-left: 2px solid ${DB.accent}; background: ${DB.accentFaint}; }
        .tb-mob-item.danger { color: ${DB.red}; }
        .tb-mob-item.danger:hover { background: rgba(255,92,92,0.08); }
      `}</style>

      {/* Fixed topbar */}
      <motion.header
        initial={{ y: -TOPBAR_H, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
          height: TOPBAR_H,
          background: `${DB.bg}f0`,
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${DB.border}`,
        }}
      >
        <div style={{ height: '100%', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>

          {/* Left: Logo */}
          <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 28, height: 28, background: DB.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
              <img src="/logo.png" alt="ACS" style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.innerHTML = '<span style="font-family:JetBrains Mono,monospace;font-size:10px;font-weight:700;color:#0E0C0A">ACS</span>'; }}
              />
            </div>
            <span className="tb-mono" style={{ fontSize: 11, fontWeight: 700, color: DB.text, letterSpacing: '0.1em', display: 'none' }}
              ref={el => { if (el) { const mq = window.matchMedia('(min-width: 640px)'); el.style.display = mq.matches ? 'block' : 'none'; mq.addEventListener('change', e => { el.style.display = e.matches ? 'block' : 'none'; }); } }}
            >
              AI COMPANION STUDIO
            </span>
          </Link>

          {/* Center: nav + search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, maxWidth: 580 }}
            className="hidden lg:flex"
          >
            <Link
              to="/dashboard"
              className={`tb-nav-link${isActive('/dashboard') ? ' active' : ''}`}
            >
              <LayoutDashboard size={11} />
              DASHBOARD
            </Link>

            <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
              <Search size={12} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: DB.muted, pointerEvents: 'none' }} />
              <input
                className="tb-search"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
              <kbd className="tb-mono" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: 9, color: DB.muted, background: DB.surface, border: `1px solid ${DB.border}`, padding: '2px 5px', letterSpacing: '0.05em' }}>
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right: new project + user */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            {/* New project */}
            <div className="hidden md:block">
              <CreateProjectModal>
                <button className="tb-new-btn">
                  <Plus size={11} />
                  NEW PROJECT
                </button>
              </CreateProjectModal>
            </div>

            {/* User menu */}
            <div ref={userMenuRef} style={{ position: 'relative' }}>
              <button className="tb-user-btn" onClick={() => setUserMenuOpen(v => !v)}>
                <div style={{
                  width: 26, height: 26,
                  background: DB.accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                  ...(user?.avatarUrl ? {} : {}),
                }}>
                  {user?.avatarUrl
                    ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span className="tb-mono" style={{ fontSize: 10, fontWeight: 700, color: '#0E0C0A' }}>{initials}</span>
                  }
                </div>
                <ChevronDown size={10} style={{ color: DB.muted }} />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.12 }}
                    style={{
                      position: 'absolute', right: 0, top: 'calc(100% + 6px)',
                      width: 220,
                      background: DB.surface,
                      border: `1px solid ${DB.border}`,
                      zIndex: 100,
                    }}
                  >
                    <div style={{ padding: '12px 14px', borderBottom: `1px solid ${DB.border}` }}>
                      <div className="tb-mono" style={{ fontSize: 11, color: DB.text, fontWeight: 600, marginBottom: 2 }}>
                        {user?.name || 'User'}
                      </div>
                      <div className="tb-mono" style={{ fontSize: 9, color: DB.muted, letterSpacing: '0.05em' }}>
                        {user?.email || ''}
                      </div>
                    </div>

                    <div style={{ padding: '4px 0' }}>
                      <Link to="/profile" className="tb-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <User size={12} />
                        PROFILE
                      </Link>
                      <Link to="/settings/security" className="tb-menu-item" onClick={() => setUserMenuOpen(false)}>
                        <Settings size={12} />
                        SETTINGS
                      </Link>
                    </div>

                    <div style={{ borderTop: `1px solid ${DB.border}`, padding: '4px 0' }}>
                      <button className="tb-menu-item danger" onClick={() => { setUserMenuOpen(false); handleLogout(); }}>
                        <LogOut size={12} />
                        LOGOUT
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile toggle */}
            <button
              className="lg:hidden tb-mono"
              onClick={() => setMobileOpen(v => !v)}
              style={{ background: 'transparent', border: `1px solid ${DB.border}`, cursor: 'pointer', padding: '5px 7px', color: DB.muted, display: 'flex', alignItems: 'center' }}
            >
              {mobileOpen ? <X size={14} /> : <Menu size={14} />}
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
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }} onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: 'absolute', right: 0, top: 0, bottom: 0, width: 280,
                background: DB.bg,
                borderLeft: `1px solid ${DB.border}`,
                display: 'flex', flexDirection: 'column',
                paddingTop: TOPBAR_H,
              }}
            >
              {/* User info */}
              <div style={{ padding: '20px 16px 16px', borderBottom: `1px solid ${DB.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 32, height: 32, background: DB.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {user?.avatarUrl
                      ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span className="tb-mono" style={{ fontSize: 11, fontWeight: 700, color: '#0E0C0A' }}>{initials}</span>
                    }
                  </div>
                  <div>
                    <div className="tb-mono" style={{ fontSize: 11, color: DB.text, fontWeight: 600 }}>{user?.name || 'User'}</div>
                    <div className="tb-mono" style={{ fontSize: 9, color: DB.muted }}>{user?.email || ''}</div>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <nav style={{ flex: 1, padding: '8px 0' }}>
                <Link
                  to="/dashboard"
                  className={`tb-mob-item${isActive('/dashboard') ? ' active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <LayoutDashboard size={13} />
                  DASHBOARD
                </Link>
                <Link to="/profile" className="tb-mob-item" onClick={() => setMobileOpen(false)}>
                  <User size={13} />
                  PROFILE
                </Link>
                <Link to="/settings/security" className="tb-mob-item" onClick={() => setMobileOpen(false)}>
                  <Settings size={13} />
                  SETTINGS
                </Link>
                <div style={{ borderTop: `1px solid ${DB.border}`, margin: '8px 0' }} />
                <button className="tb-mob-item danger" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <LogOut size={13} />
                  LOGOUT
                </button>
              </nav>

              {/* New project */}
              <div style={{ padding: 16, borderTop: `1px solid ${DB.border}` }}>
                <CreateProjectModal>
                  <button className="tb-new-btn" style={{ width: '100%', justifyContent: 'center' }}>
                    <Plus size={12} />
                    NEW PROJECT
                  </button>
                </CreateProjectModal>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
