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
      <div className="flex h-[calc(100vh-48px)] overflow-hidden bg-background relative">
        {/* Mobile overlay */}
        <div
          onClick={toggleProjectSidebar}
          className={cn(
            "fixed inset-0 bg-foreground/70 backdrop-blur-sm z-40 md:hidden transition-opacity duration-250",
            projectSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          )}
        />

        {/* SIDEBAR */}
        <aside
          className={cn(
            'h-full flex-col flex transition-all duration-300 ease-in-out border-r-2 border-primary bg-muted/30 fixed inset-y-0 left-0 z-50 md:relative md:z-30 pt-[48px] md:pt-0',
            !projectSidebarOpen
              ? '-translate-x-full md:w-0 md:opacity-0 md:translate-x-0'
              : sidebarCollapsed
                ? 'translate-x-0 md:w-[64px]'
                : 'translate-x-0 md:w-[260px] w-[260px]'
          )}
        >
          {/* Sidebar header — project identity */}
          <div className="p-4 border-b-2 border-primary min-h-[72px] flex items-start gap-3 bg-muted/50">
            <div className="w-[28px] h-[28px] shrink-0 mt-0.5 bg-background border-2 border-primary flex items-center justify-center">
              <Sparkles size={14} className="text-primary" />
            </div>
            {showFullSidebar && (
              <div className="min-w-0 flex-1">
                <div className="font-display font-bold text-[16px] text-foreground truncate leading-[1.25]">
                  {currentProject?.name || 'Project'}
                </div>
                {currentProject?.model && (
                  <div className="font-mono text-[10px] text-muted mt-1 tracking-[0.05em] uppercase font-bold">
                    {currentProject.model.split('/').pop()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* New conversation button */}
          <div className={cn("p-2", showFullSidebar ? "px-4 pt-4" : "px-2 pt-4")}>
            <button
              onClick={() => {
                createConversationInStore(projectId);
                if (isMobile) toggleProjectSidebar();
              }}
              className={cn(
                "w-full flex items-center font-mono font-bold text-[11px] tracking-[0.1em] border-2 border-primary bg-background text-foreground hover:bg-primary hover:text-background transition-colors",
                showFullSidebar ? "justify-start gap-2 py-2 px-3" : "justify-center py-2"
              )}
            >
              <Plus size={14} className="shrink-0" />
              {showFullSidebar && <span>NEW CONVERSATION</span>}
            </button>
          </div>

          {/* Conversations grouped list */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 mt-2 scrollbar-hide">
            {Object.entries(groupedConversations).map(([label, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={label} className="mb-6">
                  {showFullSidebar && (
                    <div className="flex items-center gap-2 px-2 py-1 mb-2 font-mono text-[10px] font-bold tracking-[0.2em] text-muted">
                      <span className="flex-1 h-[2px] bg-border" />
                      {label}
                      <span className="flex-1 h-[2px] bg-border" />
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
                          className={cn(
                            "group flex items-center mb-[2px] cursor-pointer transition-colors border-l-[3px]",
                            showFullSidebar ? "gap-2 py-[6px] px-2 justify-start" : "py-[8px] justify-center",
                            isActive ? "bg-muted border-primary" : "bg-transparent border-transparent hover:bg-muted/50"
                          )}
                        >
                          <MessageSquare
                            size={14}
                            className={cn("shrink-0", isActive ? "text-primary" : "text-muted")}
                          />

                          {showFullSidebar && (
                            <>
                              {isEditing ? (
                                <input
                                  ref={editInputRef}
                                  className="flex-1 min-w-0 bg-background border-2 border-primary font-mono text-[11px] px-1.5 py-0.5 outline-none text-foreground"
                                  value={editValue}
                                  onChange={e => setEditValue(e.target.value)}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') handleRename(conv.id);
                                    if (e.key === 'Escape') setEditingId(null);
                                  }}
                                  onBlur={() => handleRename(conv.id)}
                                />
                              ) : (
                                <span className={cn(
                                  "font-sans font-bold text-[13px] flex-1 min-w-0 truncate tracking-tight",
                                  isActive ? "text-foreground" : "text-foreground/70"
                                )}>
                                  {title}
                                </span>
                              )}

                              {!isEditing && (
                                <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0 transition-opacity">
                                  <button
                                    className="p-1 text-muted hover:text-foreground transition-colors"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setEditingId(conv.id);
                                      setEditValue(title);
                                    }}
                                  >
                                    <Pencil size={12} />
                                  </button>
                                  <button
                                    className="p-1 text-muted hover:text-destructive transition-colors"
                                    onClick={e => handleDelete(e, conv.id)}
                                  >
                                    <Trash2 size={12} />
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
                          <TooltipContent side="right" className="bg-background border-2 border-primary text-foreground font-sans font-bold rounded-none text-[12px]">
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
              <div className="py-8 px-2 text-center">
                <MessageSquare size={20} className="text-muted mx-auto mb-3" />
                <p className="font-mono font-bold text-[11px] tracking-[0.1em] text-muted uppercase">
                  No conversations
                </p>
              </div>
            )}
          </div>

          {/* Sidebar footer — settings shortcut */}
          {showFullSidebar && (
            <div className="border-t-2 border-primary p-4 bg-muted/50 mt-auto">
              <button
                className="w-full flex items-center justify-start gap-3 p-2 font-mono font-bold text-[11px] tracking-[0.1em] text-foreground hover:bg-muted transition-colors border-2 border-transparent hover:border-primary"
                onClick={() => navigate(`/projects/${projectId}/settings`)}
              >
                <Settings size={14} />
                <span>PROJECT SETTINGS</span>
              </button>
            </div>
          )}
        </aside>

        {/* MAIN CHAT AREA */}
        <div className="flex-1 flex flex-col min-w-0 h-full relative bg-background">
          {/* Sidebar toggle */}
          <button
            className="absolute left-4 top-4 z-40 w-[36px] h-[36px] flex items-center justify-center bg-background border-2 border-primary text-foreground hover:bg-primary hover:text-background transition-colors"
            onClick={toggleProjectSidebar}
          >
            {projectSidebarOpen ? <ChevronLeft size={16} /> : <Menu size={16} />}
          </button>

          {/* Chat messages */}
          <div className="flex-1 flex flex-col overflow-hidden w-full">
            <div className="flex-1 overflow-hidden relative w-full pt-[48px] md:pt-0">
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
            <div className="w-full bg-gradient-to-t from-background via-background to-transparent pb-6 pt-8 z-10 px-4">
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
