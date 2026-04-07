import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Search, Plus, Settings, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserAvatar } from '@/components/common/UserAvatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/store/authStore';
import { useProjectsStore } from '@/store/projectsStore';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { CreateProjectModal } from '@/components/projects';
export function AppTopbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    user,
    logout
  } = useAuthStore();
  const {
    projects,
    currentProject,
    setCurrentProject
  } = useProjectsStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const handleProjectSelect = project => {
    setCurrentProject(project);
    navigate(`/projects/${project.id}/chat`);
  };
  const isActive = path => location.pathname === path || location.pathname.startsWith(path + '/');
  return <>
            {/* Topbar */}
            <motion.header initial={{
      y: -20,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#0B0F1A]/95 backdrop-blur-xl border-b border-white/10">
                <div className="h-full px-6 flex items-center justify-between gap-8">
                    {/* Left Section: Logo */}
                    <div className="flex items-center gap-6">
                        {/* Logo */}
                        <Link to="/dashboard" className="flex items-center gap-3 shrink-0">
                            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                <img src="/logo.png" alt="AI Companion Studio" className="w-full h-full object-contain" />
                            </div>
                            <span className="font-bold text-lg text-white hidden sm:block">
                                AI Companion Studio
                            </span>
                        </Link>
                    </div>

                    {/* Center Section: Navigation + Search */}
                    <div className="hidden lg:flex items-center gap-8 flex-1 max-w-2xl">
                        {/* Navigation */}
                        <nav className="flex items-center gap-1">
                            <Link to="/dashboard">
                                <Button variant="ghost" className={cn("h-9 px-4 rounded-lg transition-all", isActive('/dashboard') ? "bg-white/10 text-white" : "text-muted-foreground hover:text-white hover:bg-white/5")}>
                                    <LayoutDashboard className="w-4 h-4 mr-2" />
                                    Dashboard
                                </Button>
                            </Link>
                        </nav>

                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                            <Input placeholder="Search projects, conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 h-9 bg-white/5 border-white/10 focus:border-blue-500/50 focus:bg-white/[0.07] rounded-lg" />
                            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-[10px] font-mono bg-white/5 border border-white/10 rounded">
                                ⌘K
                            </kbd>
                        </div>
                    </div>

                    {/* Right Section: Actions + User */}
                    <div className="flex items-center gap-3">
                        {/* New Project Button */}
                        <CreateProjectModal>
                            <Button className="hidden md:flex gap-2 h-9 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/25 rounded-lg font-semibold text-sm">
                                <Plus className="w-4 h-4" />
                                New Project
                            </Button>
                        </CreateProjectModal>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-9 px-2 rounded-lg hover:bg-white/5 gap-2">
                                    <UserAvatar avatarUrl={user?.avatarUrl} name={user?.name} size="sm" className="ring-2 ring-white/10" />
                                    <ChevronDown className="w-3 h-3 text-muted-foreground hidden md:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 bg-[#0B0F1A]/95 backdrop-blur-xl border-white/10">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground/60">{user?.email || 'user@example.com'}</p>
                                </div>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem asChild>
                                    <Link to="/profile" className="cursor-pointer">
                                        <User className="w-4 h-4 mr-2" />
                                        Profile
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link to="/settings/security" className="cursor-pointer">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Mobile Menu Toggle */}
                        <Button variant="ghost" size="icon" className="lg:hidden h-9 w-9 rounded-lg hover:bg-white/5" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </Button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            {mobileMenuOpen && <motion.div initial={{
      opacity: 0,
      x: '100%'
    }} animate={{
      opacity: 1,
      x: 0
    }} exit={{
      opacity: 0,
      x: '100%'
    }} transition={{
      duration: 0.3,
      ease: [0.23, 1, 0.32, 1]
    }} className="fixed inset-0 z-50 lg:hidden" // z-50 to cover header
    >
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />

                    {/* Menu Panel */}
                    <div className="absolute right-0 top-0 bottom-0 w-80 bg-[#0B0F1A] border-l border-white/10 p-6 overflow-y-auto flex flex-col shadow-2xl shadow-black/50">
                        {/* Mobile Menu Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
                                    <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
                                </div>
                                <span className="font-bold text-lg text-white">
                                    Menu
                                </span>
                            </div>
                            <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl hover:bg-white/5" onClick={() => setMobileMenuOpen(false)}>
                                <X className="w-6 h-6" />
                            </Button>
                        </div>

                        {/* Navigation Links */}
                        <nav className="space-y-2 flex-1">
                            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className={cn("w-full justify-start h-12 text-base",
            // Larger touch target
            isActive('/dashboard') && "bg-white/10")}>
                                    <LayoutDashboard className="w-5 h-5 mr-3" />
                                    Dashboard
                                </Button>
                            </Link>

                            <div className="my-4 border-t border-white/10" />

                            <div className="px-3 py-2 mb-2">
                                <p className="text-sm font-semibold text-white">{user?.name || 'User'}</p>
                                <p className="text-xs text-muted-foreground/60">{user?.email || 'user@example.com'}</p>
                            </div>

                            <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start h-12 text-base">
                                    <User className="w-5 h-5 mr-3" />
                                    Profile
                                </Button>
                            </Link>
                            <Link to="/settings/security" onClick={() => setMobileMenuOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start h-12 text-base">
                                    <Settings className="w-5 h-5 mr-3" />
                                    Settings
                                </Button>
                            </Link>
                            <Button variant="ghost" className="w-full justify-start h-12 text-base text-red-400 hover:text-red-400 hover:bg-red-500/10" onClick={() => {
            handleLogout();
            setMobileMenuOpen(false);
          }}>
                                <LogOut className="w-5 h-5 mr-3" />
                                Logout
                            </Button>

                        </nav>

                        <div className="mt-6 pt-6 border-t border-white/10">
                            <CreateProjectModal>
                                <Button className="w-full gap-2 h-12 text-base bg-gradient-to-r from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25">
                                    <Plus className="w-5 h-5" />
                                    New Project
                                </Button>
                            </CreateProjectModal>
                        </div>
                    </div>
                </motion.div>}
        </>;
}