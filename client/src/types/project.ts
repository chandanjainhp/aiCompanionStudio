/**
 * CANONICAL PROJECT DATA STRUCTURE
 * 
 * This is the SINGLE SOURCE OF TRUTH for project data across the entire application.
 * All backend endpoints and frontend components MUST use this structure.
 * 
 * Key Rules:
 * - All field names use camelCase
 * - All timestamps are ISO 8601 strings
 * - conversationCount is ALWAYS included (0 for new projects)
 * - NULL values are used instead of undefined
 */

export interface Project {
  // === IDENTIFIERS ===
  id: string; // UUID from database
  userId: string; // Owner of project

  // === BASIC INFO ===
  name: string; // Required, 1-100 chars
  description: string | null; // Optional, max 500 chars

  // === AI CONFIGURATION ===
  model: AIModel; // Which AI model to use
  temperature: number; // 0.0 - 1.0
  maxTokens: number; // 256 - 8192
  systemPrompt: string; // Max 4000 chars

  // === STATUS ===
  isActive: boolean; // Whether project is active

  // === STATISTICS (computed on backend) ===
  conversationCount: number; // Total conversations (ALWAYS included)
  messageCount?: number; // Optional: total messages
  lastActivityAt?: string; // Optional: ISO timestamp

  // === TIMESTAMPS (ISO 8601 format) ===
  createdAt: string; // "2025-01-16T10:30:00.000Z"
  updatedAt: string; // "2025-01-16T10:30:00.000Z"
  deletedAt: string | null; // Soft delete timestamp or null
}

export type AIModel =
  // OpenAI models
  | 'openai/gpt-4-turbo'
  | 'openai/gpt-4'
  | 'openai/gpt-3.5-turbo'
  // Anthropic models
  | 'anthropic/claude-3-opus-20250219'
  | 'anthropic/claude-3-sonnet-20250229'
  // Meta models
  | 'meta-llama/llama-3.1-405b'
  // Mistral models
  | 'mistralai/mistral-large';

// === DATA TRANSFER OBJECTS ===

/**
 * For creating new projects
 */
export interface CreateProjectDTO {
  name: string;
  description?: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

/**
 * For updating existing projects
 */
export interface UpdateProjectDTO {
  name?: string;
  description?: string;
  model?: AIModel;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  isActive?: boolean;
}

/**
 * API response structure for list endpoint
 */
export interface ProjectListResponse {
  projects: Project[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Runtime type guard to validate Project objects
 */
export function isValidProject(obj: unknown): obj is Project {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof (obj as Record<string, unknown>).id === 'string' &&
    typeof (obj as Record<string, unknown>).userId === 'string' &&
    typeof (obj as Record<string, unknown>).name === 'string' &&
    typeof (obj as Record<string, unknown>).model === 'string' &&
    typeof (obj as Record<string, unknown>).temperature === 'number' &&
    typeof (obj as Record<string, unknown>).maxTokens === 'number' &&
    typeof (obj as Record<string, unknown>).systemPrompt === 'string' &&
    typeof (obj as Record<string, unknown>).isActive === 'boolean' &&
    typeof (obj as Record<string, unknown>).conversationCount === 'number' &&
    typeof (obj as Record<string, unknown>).createdAt === 'string' &&
    typeof (obj as Record<string, unknown>).updatedAt === 'string' &&
    ((obj as Record<string, unknown>).deletedAt === null || typeof (obj as Record<string, unknown>).deletedAt === 'string')
  );
}

/**
 * Validate array of projects
 */
export function isValidProjectArray(arr: unknown): arr is Project[] {
  return Array.isArray(arr) && arr.every(isValidProject);
}
