import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Trash2,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ChatMessages, ChatInput, ChatEmptyState } from '@/components/chat';
import { useProjectsStore } from '@/store/projectsStore';
import { useUIStore } from '@/store/uiStore';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
    addMessage,
    deleteConversation,
    fetchConversations,
    fetchConversationMessages,
    sendMessage,
    fetchProjects,
  } = useProjectsStore();
  const { projectSidebarOpen, toggleProjectSidebar } = useUIStore();

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingProject, setIsLoadingProject] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [conversationsLoaded, setConversationsLoaded] = useState(false);

  // First, fetch projects if needed - only once on mount
  useEffect(() => {
    if (!hasInitialized && (!projects || projects.length === 0)) {
      setIsLoadingProject(true);
      setHasInitialized(true);
      fetchProjects().finally(() => setIsLoadingProject(false));
    }
  }, [hasInitialized, projects, fetchProjects]);

  // Load conversations when project changes
  useEffect(() => {
    if (projectId && currentProject) {
      console.log('📚 [ChatPage] Loading conversations for project:', projectId);
      setConversationsLoaded(false);
      fetchConversations(projectId)
        .then(() => {
          setConversationsLoaded(true);
        })
        .catch((error) => {
          console.error('Failed to load conversations:', error);
          setConversationsLoaded(true); // Still mark as loaded even if error
        });
    }
  }, [projectId, currentProject, fetchConversations]);

  // Load messages when current conversation changes
  useEffect(() => {
    if (projectId && currentConversation?.id && !currentConversation.messages?.length) {
      console.log('📚 [ChatPage] Loading messages for conversation:', currentConversation.id);
      fetchConversationMessages(projectId, currentConversation.id)
        .catch((error) => {
          console.error('❌ [ChatPage] Failed to load conversation messages:', error);
          toast({
            title: 'Failed to load messages',
            description: 'Could not load chat history for this conversation',
            variant: 'destructive',
          });
        });
    }
  }, [projectId, currentConversation?.id, fetchConversationMessages, toast]);

  // Set current project on mount or when projects change
  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find((p) => p.id === projectId);
      if (project) {
        setCurrentProject(project);
        // Set first conversation if none selected yet and conversations are loaded
        if (conversationsLoaded) {
          const projectConversations = conversations.filter(
            (c) => c.projectId === projectId
          );
          if (projectConversations.length > 0 && !currentConversation) {
            setCurrentConversation(projectConversations[0]);
          }
        }
      } else {
        console.error('❌ [ChatPage] Project not found in list. Available projects:', projects.map(p => p.id));
        toast({
          title: 'Project Not Found',
          description: 'This project does not exist or you do not have access to it.',
          variant: 'destructive',
        });
        navigate('/dashboard');
      }
    } else if (projectId && projects.length === 0) {
      console.warn('⚠️  [ChatPage] Projects not yet loaded. Waiting...');
    }
  }, [projectId, projects, conversations, currentConversation, conversationsLoaded, navigate, setCurrentProject, setCurrentConversation, toast]);

  const projectConversations = conversations.filter(
    (c) => c.projectId === projectId
  );

  const handleNewConversation = async () => {
    if (!projectId) return;

    try {
      setIsLoadingConversations(true);
      console.log('🚀 [handleNewConversation] Starting conversation creation...');
      
      // ✅ Step 1: Create conversation via store
      const newConversation = await createConversationInStore(projectId);
      
      // 🔴 CRITICAL VALIDATION: Ensure we got a real conversation with ID
      if (!newConversation || !newConversation.id) {
        console.error('❌ [handleNewConversation] Store returned invalid conversation:', newConversation);
        throw new Error('Failed to create conversation - no ID returned from server');
      }
      
      // 🔴 CRITICAL VALIDATION: Reject temporary IDs (all digits, timestamp-like)
      if (/^\d{13,}$/.test(newConversation.id)) {
        console.error('❌ [handleNewConversation] Store returned temporary ID:', newConversation.id);
        throw new Error('Server returned temporary ID. Please try again.');
      }
      
      console.log('✅ [handleNewConversation] Conversation created with real ID:', newConversation.id);
      
      // ✅ Step 2: Explicitly set current conversation in UI state
      console.log('🔄 [handleNewConversation] Setting current conversation...');
      setCurrentConversation(newConversation);
      
      // ✅ Step 3: Verify conversation is now active
      console.log('✅ [handleNewConversation] Conversation is now active and ready for messages');
      
      toast({
        title: 'Success',
        description: 'New conversation created',
      });
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create conversation';
      console.error('❌ [handleNewConversation] Complete error:', errorMsg);
      console.error('❌ [handleNewConversation] Error details:', error);
      
      // Clear any partial state
      setCurrentConversation(null);
      
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleSendMessage = useCallback(
    async (content: string) => {
      // 🔴 CRITICAL: Validate we have conversation BEFORE attempting send
      if (!currentConversation) {
        console.error('❌ [handleSendMessage] No current conversation selected');
        toast({
          title: 'Error',
          description: 'Please select or create a conversation first',
          variant: 'destructive',
        });
        return;
      }

      if (!projectId) {
        console.error('❌ [handleSendMessage] No project ID');
        toast({
          title: 'Error',
          description: 'Project ID is missing',
          variant: 'destructive',
        });
        return;
      }

      // 🔴 CRITICAL: Validate conversation ID is real (not temporary)
      if (!currentConversation.id) {
        console.error('❌ [handleSendMessage] Current conversation has no ID');
        setCurrentConversation(null);
        toast({
          title: 'Error',
          description: 'Invalid conversation. Please create a new one.',
          variant: 'destructive',
        });
        return;
      }

      // 🔴 CRITICAL: Reject temporary IDs (all digits, 13+ chars = timestamp)
      if (/^\d{13,}$/.test(currentConversation.id)) {
        console.error('❌ [handleSendMessage] Conversation has temporary ID:', currentConversation.id);
        setCurrentConversation(null);
        toast({
          title: 'Error',
          description: 'Conversation was not properly created. Please create a new one.',
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ [handleSendMessage] Pre-flight validation passed');
      console.log('📤 [handleSendMessage] Sending to:', {
        projectId,
        conversationId: currentConversation.id,
        contentLength: content.length,
      });

      setIsStreaming(true);
      try {
        // Use store's sendMessage which handles both user and assistant messages
        await sendMessage(
          projectId,
          currentConversation.id,
          content
        );

        console.log('✅ [handleSendMessage] Message sent and response received');
      } catch (error: unknown) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
        
        console.error('❌ [handleSendMessage] Send failed:', errorMsg);

        // Check for specific backend errors
        if (error instanceof Error && (error.message.includes('403') || error.message.includes('Project not found'))) {
          const msg = 'Project not found or you do not have access. Redirecting to dashboard...';
          console.error('❌ [handleSendMessage] Project access denied:', msg);
          
          // Clear conversation state
          setCurrentConversation(null);
          
          // Redirect to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else if (error instanceof Error && error.message.includes('Conversation not found')) {
          // Handle conversation deleted or not found
          console.error('❌ [handleSendMessage] Conversation deleted or not found');
          setCurrentConversation(null);
        }
        
        toast({
          title: 'Error',
          description: errorMsg,
          variant: 'destructive',
        });
      } finally {
        setIsStreaming(false);
        setStreamingContent('');
      }
    },
    [currentConversation, projectId, sendMessage, navigate, toast, setCurrentConversation]
  );

  const handleStopStreaming = () => {
    setIsStreaming(false);
    if (streamingContent && currentConversation) {
      addMessage(currentConversation.id, {
        role: 'assistant',
        content: streamingContent,
      });
    }
    setStreamingContent('');
  };

  if (!currentProject) {
    return null;
  }

  return (
    <div className="h-screen flex">
      {/* Project Sidebar */}
      <AnimatePresence initial={false}>
        {projectSidebarOpen && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full border-r border-border bg-background flex flex-col"
          >
            {/* Project Header */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold truncate">{currentProject.name}</h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link to={`/projects/${projectId}/settings`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Project settings</TooltipContent>
                </Tooltip>
              </div>
              <Button
                onClick={handleNewConversation}
                className="w-full gap-2"
                variant="outline"
                disabled={isLoadingConversations}
              >
                <Plus className="w-4 h-4" />
                {isLoadingConversations ? 'Creating...' : 'New Conversation'}
              </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {projectConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={cn(
                      'group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                      'hover:bg-muted',
                      currentConversation?.id === conversation.id && 'bg-muted'
                    )}
                    onClick={() => setCurrentConversation(conversation)}
                  >
                    <MessageSquare className="w-4 h-4 shrink-0 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {conversation.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(typeof conversation.updatedAt === 'string' ? new Date(conversation.updatedAt) : (conversation.updatedAt as Date), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await deleteConversation(projectId, conversation.id);
                          toast({
                            title: 'Deleted',
                            description: 'Conversation deleted',
                          });
                        } catch (error: Error | unknown) {
                          const errorMsg = error instanceof Error ? error.message : 'Failed to delete';
                          console.error('❌ [ChatPage] Delete failed:', errorMsg);
                          toast({
                            title: 'Error',
                            description: errorMsg,
                            variant: 'destructive',
                          });
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Sidebar Toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 h-12 w-6 rounded-l-none z-10"
        onClick={toggleProjectSidebar}
        style={{ left: projectSidebarOpen ? 280 : 0 }}
      >
        {projectSidebarOpen ? (
          <ChevronLeft className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </Button>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        {(currentConversation?.messages?.length ?? 0) === 0 && !isStreaming ? (
          <ChatEmptyState
            projectName={currentProject.name}
            onSuggestionClick={handleSendMessage}
          />
        ) : (
          <ChatMessages
            messages={currentConversation?.messages || []}
            isStreaming={isStreaming}
            streamingContent={streamingContent}
          />
        )}
        <ChatInput
          onSend={handleSendMessage}
          onStop={handleStopStreaming}
          isStreaming={isStreaming}
          placeholder={`Message ${currentProject.name}...`}
        />
      </div>
    </div>
  );
}
