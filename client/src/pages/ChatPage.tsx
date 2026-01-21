import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import MenuIcon from '@mui/icons-material/Menu';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { ChatMessages, ChatInput, ChatEmptyState } from '@/components/chat';
import { useProjectsStore } from '@/store/projectsStore';
import { useUIStore } from '@/store/uiStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { isToday, isYesterday, subDays, isAfter } from 'date-fns';

export default function ChatPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    sendMessage,
    fetchProjects,
  } = useProjectsStore();

  const { projectSidebarOpen, toggleProjectSidebar } = useUIStore();
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // States for renaming
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        if (!projectSidebarOpen) toggleProjectSidebar();
        else setSidebarCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [projectSidebarOpen, toggleProjectSidebar]);

  useEffect(() => {
    if (projects.length === 0) fetchProjects();
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        fetchConversations(projectId);
      } else {
        navigate('/dashboard');
      }
    }
  }, [projectId, projects, navigate, setCurrentProject, fetchConversations]);

  const groupedConversations = useMemo(() => {
    const projectConvs = conversations.filter((c) => c.projectId === projectId);
    const now = new Date();
    const sevenDaysAgo = subDays(now, 7);

    return {
      TODAY: projectConvs.filter(c => isToday(new Date(c.updatedAt))),
      YESTERDAY: projectConvs.filter(c => isYesterday(new Date(c.updatedAt))),
      'PREVIOUS 7 DAYS': projectConvs.filter(c => {
        const date = new Date(c.updatedAt);
        return !isToday(date) && !isYesterday(date) && isAfter(date, sevenDaysAgo);
      }),
    };
  }, [conversations, projectId]);

  const handleRename = async (id: string) => {
    if (!editValue.trim() || !projectId) return;
    try {
      await updateConversation(projectId, id, { title: editValue.trim() });
      setEditingId(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to rename chat", variant: "destructive" });
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!projectId) return;
    if (confirm("Are you sure you want to delete this conversation?")) {
      try {
        await deleteConversation(projectId, id);
        if (currentConversation?.id === id) setCurrentConversation(null);
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
      }
    }
  };

  const handleSendMessage = useCallback(async (content: string) => {
    if (!projectId) return;
    let conv = currentConversation;
    if (!conv) {
      conv = await createConversationInStore(projectId, content.substring(0, 40));
      setCurrentConversation(conv);
    }
    setIsStreaming(true);
    try {
      await sendMessage(projectId, conv.id, content);
    } finally {
      setIsStreaming(false);
    }
  }, [projectId, currentConversation, createConversationInStore, setCurrentConversation, sendMessage]);

  if (!currentProject) return null;

  return (
    <TooltipProvider>
      <div className="h-screen flex overflow-hidden bg-[#0B0F1A]">
        <aside
          className={cn(
            "h-screen flex-shrink-0 bg-[#0E1324] border-r border-white/10 flex flex-col transition-all duration-300 ease-in-out z-30",
            !projectSidebarOpen ? "w-0 opacity-0 -translate-x-full pointer-events-none" : sidebarCollapsed ? "w-[72px]" : "w-[280px]"
          )}
        >
          <div className="h-16 flex items-center px-4 border-b border-white/10 shrink-0">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 w-full">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shrink-0">
                  <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
                </div>
                <span className="font-bold text-white truncate text-sm tracking-tight">{currentProject.name}</span>
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center mx-auto">
                <AutoAwesomeIcon sx={{ fontSize: 16, color: 'white' }} />
              </div>
            )}
          </div>

          <div className="p-3">
            <Button
              onClick={() => createConversationInStore(projectId!)}
              variant="outline"
              className={cn(
                "w-full bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all",
                sidebarCollapsed ? "p-0 h-10 w-10 mx-auto justify-center" : "justify-start gap-3 px-3"
              )}
            >
              <Plus className="w-4 h-4" />
              {!sidebarCollapsed && <span className="text-xs font-medium">New Chat</span>}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-2 space-y-6 custom-scrollbar overflow-x-hidden">
            {(Object.entries(groupedConversations) as [keyof typeof groupedConversations, any[]]).map(([label, items]) => (
              <div key={label} className={cn(items.length === 0 && "hidden")}>
                {!sidebarCollapsed && (
                  <h3 className="px-3 mb-2 text-[10px] font-bold tracking-[0.15em] text-white/30 uppercase">
                    {label}
                  </h3>
                )}
                <div className="space-y-0.5">
                  {items.map((conv) => {
                    const isActive = currentConversation?.id === conv.id;
                    const isEditing = editingId === conv.id;

                    const content = (
                      <div
                        onClick={() => !isEditing && setCurrentConversation(conv)}
                        className={cn(
                          "relative group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200",
                          isActive
                            ? "bg-white/10 text-white border-l-2 border-blue-500 rounded-l-none"
                            : "text-white/50 hover:bg-white/5 hover:text-white",
                          sidebarCollapsed && "justify-center px-0 h-10 w-10 mx-auto"
                        )}
                      >
                        <ChatBubbleOutlineIcon sx={{ fontSize: 16 }} className={cn("shrink-0", isActive && "text-blue-400")} />

                        {!sidebarCollapsed && (
                          <>
                            {isEditing ? (
                              <input
                                ref={editInputRef}
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRename(conv.id);
                                  if (e.key === 'Escape') setEditingId(null);
                                }}
                                onBlur={() => handleRename(conv.id)}
                                className="flex-1 bg-white/10 border-none outline-none text-xs rounded px-1 text-white h-5 min-w-0"
                              />
                            ) : (
                              <span className="text-xs font-medium truncate flex-1 leading-tight pr-2">
                                {conv.title || "New Chat"}
                              </span>
                            )}

                            {/* Action Icons: Only show if not editing and hovered */}
                            {!isEditing && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(conv.id);
                                    setEditValue(conv.title || "New Chat");
                                  }}
                                  className="p-1 hover:text-blue-400 transition-colors"
                                >
                                  <EditIcon sx={{ fontSize: 12 }} />
                                </button>
                                <button
                                  onClick={(e) => handleDelete(e, conv.id)}
                                  className="p-1 hover:text-red-400 transition-colors"
                                >
                                  <DeleteIcon sx={{ fontSize: 12 }} />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );

                    return sidebarCollapsed ? (
                      <Tooltip key={conv.id} delayDuration={0}>
                        <TooltipTrigger asChild>{content}</TooltipTrigger>
                        <TooltipContent side="right" className="bg-[#161B22] border-white/10 text-[11px] font-medium text-white shadow-xl">
                          {conv.title || "New Chat"}
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div key={conv.id}>{content}</div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-full relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-4 z-40 h-8 w-8 bg-[#0B0F1A]/80 backdrop-blur border border-white/10 text-white/60 hover:text-white shadow-xl transition-all"
            onClick={toggleProjectSidebar}
          >
            {projectSidebarOpen ? <ChevronLeftIcon sx={{ fontSize: 16 }} /> : <MenuIcon sx={{ fontSize: 16 }} />}
          </Button>

          <div className="flex-1 overflow-hidden relative">
            {!currentConversation?.messages?.length && !isStreaming ? (
              <ChatEmptyState projectName={currentProject.name} onSuggestionClick={handleSendMessage} />
            ) : (
              <ChatMessages
                messages={currentConversation?.messages || []}
                isStreaming={isStreaming}
                streamingContent=""
              />
            )}
          </div>

          <div className="max-w-3xl w-full mx-auto px-4 pb-2">
            <ChatInput
              onSend={handleSendMessage}
              onStop={() => setIsStreaming(false)}
              isStreaming={isStreaming}
              placeholder={`Message ${currentProject.name}...`}
            />
            <div className="h-4" />
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}