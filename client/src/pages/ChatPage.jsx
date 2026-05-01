import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, ChevronLeft, Menu, Pencil, Trash2, Sparkles, Settings } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ChatMessages, ChatInput, ChatEmptyState } from '@/components/chat';
import { useProjectsStore } from '@/store/projectsStore';
import { useUIStore } from '@/store/uiStore';
import { useToast } from '@/hooks/use-toast';
import useApiErrorHandler from '@/hooks/useApiErrorHandler';
import { cn } from '@/lib/utils';
import { isToday, isYesterday, subDays, isAfter } from 'date-fns';

const CP = {
  sidebarBg: '#0C0A08',
  sidebarBorder: '#1E1912',
  mainBg: '#131109',
  accent: '#0D9488',
  accentBg: 'rgba(13,148,136,0.08)',
  accentBorder: 'rgba(13,148,136,0.35)',
  text: '#E2D9CE',
  muted: '#6A5F53',
  mutedBright: '#9A8A78',
  hover: 'rgba(255,255,255,0.035)',
  red: '#EF4444',
};

export default function ChatPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleApiError } = useApiErrorHandler();
  const {
    projects,
    currentProject,
    setCurrentProject,
    conversations,
    currentConversation,
    createConversation: createConversationInStore,
    setCurrentConversation,
    updateConversation,
    deleteConversation,
    fetchConversations,
    fetchConversationMessages,
    sendMessage,
    fetchProjects,
  } = useProjectsStore();
  const { projectSidebarOpen, toggleProjectSidebar } = useUIStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const editInputRef = useRef(null);

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,500&family=DM+Mono:wght@400;500&display=swap';
    document.head.appendChild(link);
    return () => { if (document.head.contains(link)) document.head.removeChild(link); };
  }, []);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (!projectSidebarOpen) {
          toggleProjectSidebar();
        } else {
          setSidebarCollapsed(prev => !prev);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectSidebarOpen, toggleProjectSidebar]);

  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        fetchConversations(projectId);
      } else {
        navigate('/dashboard');
      }
    }
  }, [projectId, projects, navigate, setCurrentProject, fetchConversations]);

  useEffect(() => {
    if (currentConversation?.id && projectId) {
      const hasMessages = Array.isArray(currentConversation?.messages) && currentConversation.messages.length > 0;
      if (!hasMessages) {
        fetchConversationMessages(projectId, currentConversation.id).catch(err => {
          console.error('Failed to load conversation messages:', err);
        });
      }
    }
  }, [currentConversation?.id, projectId, fetchConversationMessages]);

  const groupedConversations = useMemo(() => {
    const projectConvs = conversations.filter(c => c.projectId === projectId);
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);
    return {
      TODAY: projectConvs.filter(c => isToday(new Date(c.updatedAt))),
      YESTERDAY: projectConvs.filter(c => isYesterday(new Date(c.updatedAt))),
      'LAST 7 DAYS': projectConvs.filter(c => {
        const date = new Date(c.updatedAt);
        return !isToday(date) && !isYesterday(date) && isAfter(date, sevenDaysAgo);
      }),
    };
  }, [conversations, projectId]);

  const handleRename = useCallback(async (id) => {
    if (!editValue.trim() || !projectId) return;
    try {
      await updateConversation(projectId, id, editValue.trim());
      setEditingId(null);
    } catch {
      toast({ title: 'Error', description: 'Failed to rename chat', variant: 'destructive' });
    }
  }, [editValue, projectId, updateConversation, toast]);

  const handleDelete = useCallback(async (e, id) => {
    e.stopPropagation();
    if (!projectId) return;
    if (confirm('Are you sure you want to delete this conversation?')) {
      try {
        await deleteConversation(projectId, id);
        if (currentConversation?.id === id) setCurrentConversation(null);
      } catch {
        toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
      }
    }
  }, [projectId, currentConversation?.id, deleteConversation, setCurrentConversation, toast]);

  const handleSendMessage = useCallback(async (content) => {
    if (!projectId) return;
    try {
      let conv = currentConversation;
      if (!conv) {
        conv = await createConversationInStore(projectId, content.substring(0, 40));
        setCurrentConversation(conv);
      }
      setIsStreaming(true);
      await sendMessage(projectId, conv.id, content);
    } catch (err) {
      console.error('❌ [ChatPage] Failed to send message:', err);
      const handled = handleApiError(err);
      if (!handled) {
        toast({
          title: 'Message Failed',
          description: err?.message || 'Failed to send your message. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsStreaming(false);
    }
  }, [projectId, currentConversation, createConversationInStore, setCurrentConversation, sendMessage, toast, handleApiError]);

  if (!currentProject) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const showFullSidebar = !sidebarCollapsed || isMobile;

  return (
    <TooltipProvider>
      <style>{`
        .cp-dm { font-family: 'DM Mono', 'Courier New', monospace; }
        .cp-serif { font-family: 'Playfair Display', Georgia, serif; }
        .cp-conv-item { transition: background 0.12s; cursor: pointer; }
        .cp-conv-item:hover { background: ${CP.hover}; }
        .cp-conv-actions { opacity: 0; transition: opacity 0.12s; }
        .cp-conv-item:hover .cp-conv-actions { opacity: 1; }
        .cp-new-btn:hover { background: rgba(13,148,136,0.12) !important; color: ${CP.accent} !important; }
        .cp-new-btn:hover .cp-new-icon { color: ${CP.accent}; }
        .cp-icon-btn { background: transparent; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: color 0.12s; }
        .cp-edit-btn:hover { color: ${CP.mutedBright} !important; }
        .cp-del-btn:hover { color: ${CP.red} !important; }
        .cp-toggle:hover { border-color: ${CP.accent} !important; color: ${CP.accent} !important; }
        .cp-scroll::-webkit-scrollbar { width: 4px; }
        .cp-scroll::-webkit-scrollbar-track { background: transparent; }
        .cp-scroll::-webkit-scrollbar-thumb { background: ${CP.sidebarBorder}; border-radius: 2px; }
        .cp-edit-input { background: rgba(255,255,255,0.06); border: 1px solid rgba(13,148,136,0.4); outline: none; color: ${CP.text}; font-size: 11px; padding: 2px 6px; flex: 1; min-width: 0; font-family: 'DM Mono', monospace; }
        .cp-edit-input:focus { border-color: ${CP.accent}; }
      `}</style>

      <div style={{ height: 'calc(100vh - 56px)', display: 'flex', overflow: 'hidden', backgroundColor: CP.mainBg, position: 'relative' }}>

        {/* Mobile overlay */}
        <div
          onClick={toggleProjectSidebar}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)', zIndex: 40,
            opacity: projectSidebarOpen ? 1 : 0,
            pointerEvents: projectSidebarOpen ? 'auto' : 'none',
            transition: 'opacity 0.25s',
          }}
          className="md:hidden"
        />

        {/* SIDEBAR */}
        <aside
          className={cn(
            'h-screen flex-col flex transition-all duration-300 ease-in-out',
            'fixed inset-y-0 left-0 z-50',
            'md:relative md:z-30',
            !projectSidebarOpen
              ? '-translate-x-full md:w-0 md:opacity-0 md:translate-x-0'
              : sidebarCollapsed
                ? 'translate-x-0 md:w-[64px]'
                : 'translate-x-0 md:w-[260px]'
          )}
          style={{ width: isMobile ? 260 : undefined, backgroundColor: CP.sidebarBg, borderRight: `1px solid ${CP.sidebarBorder}` }}
        >

          {/* Sidebar header — project identity */}
          <div
            style={{
              padding: '20px 16px 16px',
              borderBottom: `1px solid ${CP.sidebarBorder}`,
              display: 'flex', alignItems: 'flex-start', gap: 10,
              minHeight: 72,
            }}
          >
            <div
              style={{
                width: 28, height: 28, borderRadius: 6, flexShrink: 0, marginTop: 2,
                backgroundColor: CP.accentBg, border: `1px solid ${CP.accentBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Sparkles size={13} color={CP.accent} />
            </div>
            {showFullSidebar && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  className="cp-serif"
                  style={{
                    fontSize: 14, fontWeight: 600, color: CP.text,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    lineHeight: 1.25,
                  }}
                >
                  {currentProject?.name || 'Project'}
                </div>
                {currentProject?.model && (
                  <div className="cp-dm" style={{ fontSize: 9, color: CP.muted, marginTop: 3, letterSpacing: '0.05em' }}>
                    {currentProject.model.split('/').pop()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New conversation button */}
          <div style={{ padding: showFullSidebar ? '10px 10px 8px' : '10px 8px 8px' }}>
            <button
              className="cp-dm cp-new-btn"
              onClick={() => {
                createConversationInStore(projectId);
                if (isMobile) toggleProjectSidebar();
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: showFullSidebar ? 8 : 0,
                justifyContent: showFullSidebar ? 'flex-start' : 'center',
                padding: showFullSidebar ? '7px 10px' : '7px',
                backgroundColor: 'transparent', border: `1px solid ${CP.sidebarBorder}`,
                color: CP.muted, fontSize: 10, letterSpacing: '0.12em',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              <Plus size={12} className="cp-new-icon shrink-0" style={{ color: CP.muted, transition: 'color 0.15s' }} />
              {showFullSidebar && <span>NEW CONVERSATION</span>}
            </button>
          </div>

          {/* Conversations grouped list */}
          <div className="cp-scroll flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: '4px 8px 16px' }}>
            {Object.entries(groupedConversations).map(([label, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={label} style={{ marginBottom: 16 }}>
                  {showFullSidebar && (
                    <div
                      className="cp-dm"
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '8px 8px 4px',
                        fontSize: 8, letterSpacing: '0.22em', color: CP.muted,
                      }}
                    >
                      <span style={{ flex: 1, height: '1px', backgroundColor: CP.sidebarBorder }} />
                      {label}
                      <span style={{ flex: 1, height: '1px', backgroundColor: CP.sidebarBorder }} />
                    </div>
                  )}
                  <div>
                    {items.map(conv => {
                      const isActive = currentConversation?.id === conv.id;
                      const isEditing = editingId === conv.id;
                      const title = typeof conv?.title === 'string' ? conv.title : 'New Chat';

                      const content = (
                        <div
                          onClick={() => {
                            if (!isEditing) {
                              setCurrentConversation(conv);
                              if (isMobile) toggleProjectSidebar();
                            }
                          }}
                          className="cp-conv-item"
                          style={{
                            display: 'flex', alignItems: 'center',
                            gap: showFullSidebar ? 8 : 0,
                            justifyContent: showFullSidebar ? 'flex-start' : 'center',
                            padding: showFullSidebar ? '6px 8px' : '8px',
                            marginBottom: 1,
                            backgroundColor: isActive ? CP.accentBg : 'transparent',
                            borderLeft: isActive ? `2px solid ${CP.accent}` : '2px solid transparent',
                            position: 'relative',
                          }}
                        >
                          {/* Icon */}
                          <MessageSquare
                            size={12}
                            style={{ color: isActive ? CP.accent : CP.muted, flexShrink: 0 }}
                          />

                          {showFullSidebar && (
                            <>
                              {isEditing ? (
                                <input
                                  ref={editInputRef}
                                  className="cp-edit-input"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleRename(conv.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  onBlur={() => handleRename(conv.id)}
                                />
                              ) : (
                                <span
                                  className="cp-dm"
                                  style={{
                                    fontSize: 11, flex: 1, minWidth: 0,
                                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                    color: isActive ? CP.text : CP.muted,
                                    letterSpacing: '0.01em',
                                  }}
                                >
                                  {title}
                                </span>
                              )}

                              {!isEditing && (
                                <div className="cp-conv-actions" style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                                  <button
                                    className="cp-icon-btn cp-edit-btn"
                                    style={{ padding: 3, color: CP.muted }}
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditingId(conv.id);
                                      setEditValue(title);
                                    }}
                                  >
                                    <Pencil size={10} />
                                  </button>
                                  <button
                                    className="cp-icon-btn cp-del-btn"
                                    style={{ padding: 3, color: CP.muted }}
                                    onClick={e => handleDelete(e, conv.id)}
                                  >
                                    <Trash2 size={10} />
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );

                      return sidebarCollapsed && !isMobile ? (
                        <Tooltip key={conv.id} delayDuration={0}>
                          <TooltipTrigger asChild>{content}</TooltipTrigger>
                          <TooltipContent
                            side="right"
                            style={{ backgroundColor: '#1A1612', border: `1px solid ${CP.sidebarBorder}`, color: CP.text, fontSize: 11 }}
                          >
                            {title}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <div key={conv.id}>{content}</div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Empty sidebar state */}
            {Object.values(groupedConversations).every(g => g.length === 0) && showFullSidebar && (
              <div style={{ padding: '32px 8px', textAlign: 'center' }}>
                <MessageSquare size={18} style={{ color: CP.muted, margin: '0 auto 10px' }} />
                <p className="cp-dm" style={{ fontSize: 10, color: CP.muted, letterSpacing: '0.1em' }}>
                  No conversations yet.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar footer — settings shortcut */}
          {showFullSidebar && (
            <div style={{ borderTop: `1px solid ${CP.sidebarBorder}`, padding: '10px 10px' }}>
              <button
                className="cp-icon-btn cp-edit-btn"
                style={{ width: '100%', padding: '6px 8px', gap: 8, justifyContent: 'flex-start', color: CP.muted, fontSize: 10 }}
                onClick={() => navigate(`/projects/${projectId}/settings`)}
              >
                <Settings size={12} />
                <span className="cp-dm" style={{ letterSpacing: '0.12em' }}>PROJECT SETTINGS</span>
              </button>
            </div>
          )}
        </aside>

        {/* MAIN CHAT AREA */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', position: 'relative', backgroundColor: CP.mainBg }}>

          {/* Sidebar toggle */}
          <button
            className="cp-toggle"
            onClick={toggleProjectSidebar}
            style={{
              position: 'absolute', left: 14, top: 14, zIndex: 40,
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: CP.sidebarBg, border: `1px solid ${CP.sidebarBorder}`,
              color: CP.muted, cursor: 'pointer', transition: 'border-color 0.15s, color 0.15s',
            }}
          >
            {projectSidebarOpen ? <ChevronLeft size={13} /> : <Menu size={13} />}
          </button>

          {/* Chat messages */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', width: '100%' }}>
            <div style={{ flex: 1, overflow: 'hidden', position: 'relative', width: '100%' }}>
              {!currentConversation?.messages?.length && !isStreaming ? (
                <ChatEmptyState
                  projectName={currentProject?.name || 'Project'}
                  onSuggestionClick={handleSendMessage}
                />
              ) : (
                <ChatMessages
                  messages={currentConversation?.messages || []}
                  isStreaming={isStreaming}
                  streamingContent=""
                />
              )}
            </div>

            {/* Input wrapper */}
            <div
              style={{
                width: '100%',
                background: `linear-gradient(to top, ${CP.mainBg} 65%, transparent)`,
                paddingBottom: 16, paddingTop: 28,
              }}
            >
              <ChatInput
                onSend={handleSendMessage}
                onStop={() => setIsStreaming(false)}
                isStreaming={isStreaming}
                placeholder={`Message ${currentProject?.name || 'Project'}…`}
              />
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
