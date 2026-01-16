// Re-export canonical project type
export type { 
  Project, 
  AIModel, 
  CreateProjectDTO, 
  UpdateProjectDTO,
  ProjectListResponse,
  isValidProject,
  isValidProjectArray
} from './project';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date | string;
  isLoading?: boolean; // For typing indicator while streaming/loading
}

export interface Conversation {
  id: string;
  projectId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptVersion {
  id: string;
  content: string;
  version: number;
  createdAt: Date;
  isActive: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
}
