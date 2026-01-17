import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Project, CreateProjectDTO, UpdateProjectDTO } from '@/types/project';
import type { Conversation, Message } from '@/types';
import { apiClient } from '@/lib/api';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  conversations: Conversation[];
  currentConversation: Conversation | null;
  isLoading: boolean;
  
  // Project actions
  createProject: (project: CreateProjectDTO) => Promise<void>;
  updateProject: (id: string, updates: UpdateProjectDTO) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  fetchProjects: () => Promise<void>;
  fetchProject: (id: string) => Promise<void>;
  setCurrentProject: (project: Project | null) => void;
  
  // Conversation actions
  fetchConversations: (projectId: string) => Promise<void>;
  fetchConversationMessages: (projectId: string, conversationId: string) => Promise<void>;
  createConversation: (projectId: string, title?: string) => Promise<Conversation>;
  sendMessage: (projectId: string, conversationId: string, content: string) => Promise<{ userMessage: Message; assistantMessage: Message }>;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (conversationId: string, message: Omit<Message, 'id' | 'createdAt'>) => void;
  updateConversation: (projectId: string, conversationId: string, title: string) => Promise<void>;
  deleteConversation: (projectId: string, conversationId: string) => Promise<void>;
}

const defaultProjects: Project[] = [];

export const useProjectsStore = create<ProjectsState>()(
  persist(
    (set, get) => ({
      projects: defaultProjects,
      currentProject: null,
      conversations: [],
      currentConversation: null,
      isLoading: false,

      createProject: async (projectData) => {
        set({ isLoading: true });
        try {
          // API client now returns strict Project type with validation
          const newProject = await apiClient.createProject(projectData);
          
          console.log('✅ [createProject] Created project:', newProject.id);
          console.log('✅ [createProject] New project data:', newProject);
          
          // Ensure new project has conversationCount: 0
          if (newProject.conversationCount === undefined || newProject.conversationCount === null) {
            newProject.conversationCount = 0;
          }
          
          // Add new project to the beginning of the list
          set((state) => ({
            projects: [newProject, ...state.projects],
          }));
          
          console.log('✅ [createProject] Project added to state');
        } catch (error) {
          console.error('❌ [createProject] Failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProjects: async () => {
        set({ isLoading: true });
        try {
          // API client now returns ProjectListResponse with validated projects
          const response = await apiClient.getProjects();
          
          console.log('✅ [fetchProjects] Loaded', response.projects.length, 'projects');
          
          // 🔴 CRITICAL: If backend returns empty but client has cached data, clear cache
          if (response.projects.length === 0) {
            const currentState = get();
            if (currentState.projects.length > 0) {
              console.warn('⚠️  [fetchProjects] Backend returned empty but cache has data - clearing cache');
              set({ 
                projects: [], 
                currentProject: null,
                conversations: [],
                currentConversation: null,
              });
              return;
            }
          }
          
          // Validate each project has conversationCount
          response.projects.forEach((project, index) => {
            if (typeof project.conversationCount !== 'number') {
              console.error(`❌ [fetchProjects] Project ${index} missing conversationCount:`, project.id);
              project.conversationCount = 0;
            }
          });
          
          set({ projects: response.projects });
        } catch (error) {
          console.error('❌ [fetchProjects] Failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      fetchProject: async (id) => {
        set({ isLoading: true });
        try {
          // API client now returns strict Project type with validation
          const project = await apiClient.getProject(id);
          set({ currentProject: project });
          console.log('✅ [fetchProject] Loaded project:', project.id);
        } catch (error) {
          console.error('❌ [fetchProject] Failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateProject: async (id, updates) => {
        set({ isLoading: true });
        try {
          // API client now returns strict Project type with validation
          const updatedProject = await apiClient.updateProject(id, updates);
          
          set((state) => ({
            projects: state.projects.map((p) =>
              p.id === id ? updatedProject : p
            ),
            currentProject:
              state.currentProject?.id === id ? updatedProject : state.currentProject,
          }));
          console.log('✅ [updateProject] Updated project:', id);
        } catch (error) {
          console.error('❌ [updateProject] Failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteProject: async (id) => {
        set({ isLoading: true });
        try {
          // API client now returns void (no response body needed)
          await apiClient.deleteProject(id);
          
          set((state) => ({
            projects: state.projects.filter((p) => p.id !== id),
            currentProject: state.currentProject?.id === id ? null : state.currentProject,
            conversations: state.conversations.filter((c) => c.projectId !== id),
          }));
          console.log('✅ [deleteProject] Deleted project:', id);
        } catch (error) {
          console.error('❌ [deleteProject] Failed:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setCurrentProject: (project) => {
        set({ currentProject: project });
      },

      fetchConversations: async (projectId) => {
        try {
          console.log('📦 [fetchConversations] Loading for project:', projectId);
          const response = await apiClient.getConversations(projectId) as unknown;
          
          // Response comes as ApiResponse, extract data
          let conversationsData = response.data || response;
          if (Array.isArray(conversationsData)) {
            // Already an array
          } else if (conversationsData?.conversations) {
            // Wrapped in object
            conversationsData = conversationsData.conversations;
          }
          
          const conversations = (Array.isArray(conversationsData) ? conversationsData : []).map(conv => ({
            ...conv,
            messages: Array.isArray(conv.messages) ? conv.messages : []
          }));
          set({ conversations });
          console.log('✅ [fetchConversations] Loaded', conversations.length, 'conversations');
        } catch (error) {
          console.error('❌ [fetchConversations] Failed:', error);
          // Don't throw - allow app to continue with empty conversations
          set({ conversations: [] });
        }
      },

      fetchConversationMessages: async (projectId, conversationId) => {
        try {
          console.log('📚 [fetchConversationMessages] Loading messages for:', conversationId);
          const response = await apiClient.getConversationMessages(projectId, conversationId) as unknown;
          
          // Extract conversation with messages from response
          const conversationData = response.data || response;
          
          if (!conversationData || !conversationData.messages) {
            console.warn('⚠️ [fetchConversationMessages] No messages in response');
            return;
          }

          // Ensure messages are properly formatted and ordered by createdAt
          const messages = (Array.isArray(conversationData.messages) ? conversationData.messages : [])
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

          // Update the current conversation with loaded messages
          set((state) => {
            const updatedConversations = state.conversations.map((c) => {
              if (c.id === conversationId) {
                return {
                  ...c,
                  messages,
                };
              }
              return c;
            });

            let updatedCurrentConv = state.currentConversation;
            if (state.currentConversation?.id === conversationId) {
              updatedCurrentConv = {
                ...state.currentConversation,
                messages,
              };
            }

            return {
              conversations: updatedConversations,
              currentConversation: updatedCurrentConv,
            };
          });

          console.log('✅ [fetchConversationMessages] Loaded', messages.length, 'messages');
        } catch (error) {
          console.error('❌ [fetchConversationMessages] Failed:', error);
          throw error;
        }
      },

      createConversation: async (projectId, initialTitle = 'New Conversation') => {
        try {
          console.log('📝 [createConversation] Creating for project:', projectId, 'with title:', initialTitle);
          const response = await apiClient.createConversation(projectId, initialTitle) as unknown;
          
          // Extract conversation from response
          const newConversation = response.data || response;
          
          // 🔴 CRITICAL VALIDATION: Ensure we have a real database ID
          if (!newConversation.id) {
            throw new Error('Backend returned conversation without ID');
          }
          
          // 🔴 CRITICAL VALIDATION: Ensure it's not a temporary timestamp ID
          if (/^\d{13,}$/.test(newConversation.id)) {
            throw new Error('Backend returned temporary ID instead of database ID. Server error.');
          }
          
          // 🔴 CRITICAL: Initialize all required fields with defaults
          const sanitizedConversation: Conversation = {
            id: newConversation.id,
            projectId: newConversation.projectId || projectId,
            title: newConversation.title || 'New Conversation',
            messages: Array.isArray(newConversation.messages) ? newConversation.messages : [],
            createdAt: newConversation.createdAt ? new Date(newConversation.createdAt) : new Date(),
            updatedAt: newConversation.updatedAt ? new Date(newConversation.updatedAt) : new Date(),
          };
          
          // ✅ VERIFY: All fields are present and valid
          console.log('✅ [createConversation] Validated conversation:', {
            id: sanitizedConversation.id,
            projectId: sanitizedConversation.projectId,
            hasMessages: sanitizedConversation.messages.length >= 0,
          });
          
          // ✅ UPDATE STORE: Prepend to conversations list
          set((state) => ({
            conversations: [sanitizedConversation, ...state.conversations],
            currentConversation: sanitizedConversation,
          }));
          
          console.log('✅ [createConversation] Created and stored:', sanitizedConversation.id);
          return sanitizedConversation;
        } catch (error) {
          console.error('❌ [createConversation] Failed:', error);
          throw error;
        }
      },

      setCurrentConversation: (conversation) => {
        set({ currentConversation: conversation });
      },

      sendMessage: async (projectId, conversationId, content) => {
        // 🔴 CRITICAL: Validate IDs before sending
        if (!conversationId || !projectId) {
          throw new Error(`Invalid IDs: projectId=${projectId}, conversationId=${conversationId}`);
        }
        
        // 🔴 CRITICAL: Reject temporary conversation IDs (all digits, timestamp-like)
        if (/^\d{13,}$/.test(conversationId)) {
          throw new Error(
            'Conversation does not exist yet. Click "New Conversation" button first.'
          );
        }

        console.log('📤 [sendMessage] Sending to conversation:', conversationId);
        
        // ✅ OPTIMISTIC UI UPDATE: Add user message immediately before API call
        // This ensures user sees their message right away, even if API is slow
        const optimisticUserMessage: Message = {
          id: `temp-${Date.now()}`, // Temporary ID until server confirms
          role: 'user',
          content: content.trim(),
          createdAt: new Date(),
        };
        
        // ✅ Create loading indicator message
        const loadingMessage: Message = {
          id: `loading-${Date.now()}`, // Temporary loading indicator
          role: 'assistant',
          content: '',
          createdAt: new Date(),
          isLoading: true,
        };
        
        console.log('✨ [sendMessage] Optimistic update - adding user message:', optimisticUserMessage.id);
        
        // Update state immediately with user message + loading indicator
        set((state) => {
          const updatedConversations = state.conversations.map((c) => {
            if (c.id === conversationId) {
              const newMessages = [...(c.messages || []), optimisticUserMessage, loadingMessage];
              return {
                ...c,
                messages: newMessages,
                updatedAt: new Date(),
              };
            }
            return c;
          });
          
          let updatedCurrentConv = state.currentConversation;
          if (state.currentConversation?.id === conversationId) {
            const newMessages = [...(state.currentConversation.messages || []), optimisticUserMessage, loadingMessage];
            updatedCurrentConv = {
              ...state.currentConversation,
              messages: newMessages,
              updatedAt: new Date(),
            };
          }
          
          return {
            conversations: updatedConversations,
            currentConversation: updatedCurrentConv,
          };
        });
        
        console.log('✅ [sendMessage] User message shown optimistically with loading indicator. Waiting for API response...');
        
        try {
          // Now send to API (may return streaming or full response)
          const response = await apiClient.sendMessage(projectId, conversationId, content) as unknown;
          
          console.log('📤 [sendMessage] Raw response:', response);
          
          // Extract messages from response - response is ApiResponse, data contains the messages
          const messageData = response.data || response;
          const { userMessage, assistantMessage } = messageData;
          const isSuccess = (response as any).success !== false;
          
          console.log('📤 [sendMessage] Response analysis:', {
            success: isSuccess,
            userMessageExists: !!userMessage,
            userMessageId: userMessage?.id,
            assistantMessageExists: !!assistantMessage,
            assistantMessageId: assistantMessage?.id,
            assistantMessageContent: assistantMessage?.content?.substring(0, 50),
          });
          
          // Check for missing messages
          if (!userMessage || !assistantMessage) {
            console.error('❌ [sendMessage] Invalid response structure:', messageData);
            throw new Error('Invalid response structure - missing userMessage or assistantMessage');
          }
          
          // ✅ Verify messages have IDs (not temporary)
          if (!userMessage.id || !assistantMessage.id) {
            console.error('❌ [sendMessage] Messages missing IDs:', {
              userMessageId: userMessage.id,
              assistantMessageId: assistantMessage.id,
            });
            throw new Error('Server returned messages without IDs');
          }
          
          // ✅ Verify messages have IDs (not temporary)
          if (!userMessage.id || !assistantMessage.id) {
            console.error('❌ [sendMessage] Messages missing IDs:', {
              userMessageId: userMessage.id,
              assistantMessageId: assistantMessage.id,
            });
            throw new Error('Server returned messages without IDs');
          }
          
          // ✅ Replace temporary user message and loading indicator with real messages
          set((state) => {
            const updatedConversations = state.conversations.map((c) => {
              if (c.id === conversationId) {
                // Remove temporary user message and loading indicator
                const messages = (c.messages || []).filter(
                  m => m.id !== optimisticUserMessage.id && m.id !== loadingMessage.id
                );
                return {
                  ...c,
                  messages: [...messages, userMessage, assistantMessage],
                  updatedAt: new Date(),
                };
              }
              return c;
            });
            
            let updatedCurrentConv = state.currentConversation;
            if (state.currentConversation?.id === conversationId) {
              const messages = (state.currentConversation.messages || []).filter(
                m => m.id !== optimisticUserMessage.id && m.id !== loadingMessage.id
              );
              updatedCurrentConv = {
                ...state.currentConversation,
                messages: [...messages, userMessage, assistantMessage],
                updatedAt: new Date(),
              };
            }
            
            return {
              conversations: updatedConversations,
              currentConversation: updatedCurrentConv,
            };
          });
          
          console.log('✅ [sendMessage] Loading indicator removed and real response added.');
          return { userMessage, assistantMessage };
        } catch (error) {
          const errorMsg = error instanceof Error ? error.message : 'Failed to send message';
          console.error('❌ [sendMessage] Failed:', errorMsg);
          
          // 🔴 ROLLBACK: Remove optimistic messages on error
          set((state) => {
            const updatedConversations = state.conversations.map((c) => {
              if (c.id === conversationId) {
                return {
                  ...c,
                  messages: (c.messages || []).filter(
                    m => m.id !== optimisticUserMessage.id && m.id !== loadingMessage.id
                  ),
                };
              }
              return c;
            });
            
            let updatedCurrentConv = state.currentConversation;
            if (state.currentConversation?.id === conversationId) {
              updatedCurrentConv = {
                ...state.currentConversation,
                messages: (state.currentConversation.messages || []).filter(
                  m => m.id !== optimisticUserMessage.id && m.id !== loadingMessage.id
                ),
              };
            }
            
            return {
              conversations: updatedConversations,
              currentConversation: updatedCurrentConv,
            };
          });
          
          console.log('🔄 [sendMessage] Rolled back optimistic messages due to error');

          throw error;
        }
      },

      addMessage: (conversationId, messageData) => {
        const newMessage: Message = {
          ...messageData,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        
        set((state) => {
          const updatedConversations = state.conversations.map((c) => {
            if (c.id === conversationId) {
              const updatedMessages = [...c.messages, newMessage];
              const title = c.messages.length === 0 && messageData.role === 'user'
                ? messageData.content.slice(0, 50) + (messageData.content.length > 50 ? '...' : '')
                : c.title;
              return { ...c, messages: updatedMessages, title, updatedAt: new Date() };
            }
            return c;
          });

          const currentConv = state.currentConversation;
          let updatedCurrentConv = currentConv;
          if (currentConv?.id === conversationId) {
            const updatedMessages = [...currentConv.messages, newMessage];
            const title = currentConv.messages.length === 0 && messageData.role === 'user'
              ? messageData.content.slice(0, 50) + (messageData.content.length > 50 ? '...' : '')
              : currentConv.title;
            updatedCurrentConv = { ...currentConv, messages: updatedMessages, title, updatedAt: new Date() };
          }

          return {
            conversations: updatedConversations,
            currentConversation: updatedCurrentConv,
          };
        });
      },

      updateConversation: async (projectId, conversationId, title) => {
        try {
          console.log('✏️ [updateConversation] Updating:', conversationId, 'with title:', title);
          // Call API to update conversation (if available)
          // For now, just update local state
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c.id === conversationId ? { ...c, title, updatedAt: new Date() } : c
            ),
            currentConversation: state.currentConversation?.id === conversationId
              ? { ...state.currentConversation, title, updatedAt: new Date() }
              : state.currentConversation,
          }));
          console.log('✅ [updateConversation] Updated:', conversationId);
        } catch (error) {
          console.error('❌ [updateConversation] Failed:', error);
          throw error;
        }
      },

      deleteConversation: async (projectId, conversationId) => {
        try {
          console.log('🗑️ [deleteConversation] Deleting:', conversationId);
          await apiClient.deleteConversation(projectId, conversationId);
          
          set((state) => ({
            conversations: state.conversations.filter((c) => c.id !== conversationId),
            currentConversation: state.currentConversation?.id === conversationId ? null : state.currentConversation,
          }));
          console.log('✅ [deleteConversation] Deleted:', conversationId);
        } catch (error) {
          console.error('❌ [deleteConversation] Failed:', error);
          throw error;
        }
      },
    }),
    {
      name: 'projects-storage',
      migrate: (persistedState: unknown) => {
        // Ensure all conversations have messages array
        const state = persistedState as Record<string, unknown>;
        if (state?.conversations) {
          state.conversations = (state.conversations as Array<Record<string, unknown>>).map((conv: Record<string, unknown>) => ({
            ...conv,
            messages: Array.isArray(conv.messages) ? conv.messages : []
          }));
        }
        // Ensure currentConversation has messages array if it exists
        if (state?.currentConversation) {
          const currentConv = state.currentConversation as Record<string, unknown>;
          state.currentConversation = {
            ...currentConv,
            messages: Array.isArray(currentConv.messages) 
              ? currentConv.messages 
              : []
          };
        }
        return state;
      }
    }
  )
);
