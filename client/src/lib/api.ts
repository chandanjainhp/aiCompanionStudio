// src/lib/api.ts
import { requestAudit } from './request-audit';
import { resetProjectsData } from './appStateReset';
import type { Project, CreateProjectDTO, UpdateProjectDTO, ProjectListResponse } from '@/types/project';
import { isValidProject, isValidProjectArray } from '@/types/project';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  isNewUser?: boolean;
}

export interface SendOTPResponse {
  expiresIn: number;
}

class ApiClient {
  private token: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    // Get token from localStorage on init
    this.token = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  private setToken(token: string) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }

  private setRefreshToken(token: string) {
    this.refreshToken = token;
    localStorage.setItem('refreshToken', token);
  }

  private getToken(): string | null {
    return this.token || localStorage.getItem('accessToken');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private getFetchOptions(method: string, body?: any) {
    return {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include' as const,
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const startTime = Date.now();
    const method = response.headers.get('x-method') || 'UNKNOWN';
    const endpoint = response.url.replace(API_URL, '') || response.url;

    console.log('📡 [api] Response received:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: {
        contentType: response.headers.get('content-type'),
        cors: response.headers.get('access-control-allow-origin'),
      },
    });

    let data;
    try {
      data = await response.json();
      console.log('📦 [api] Response JSON parsed successfully');
      console.log('📦 [api] Response data:', data);
    } catch (parseError) {
      console.error('❌ [api] Failed to parse response JSON:', parseError);
      requestAudit.logRequestComplete(endpoint, method, response.status, Date.now() - startTime);
      throw new Error('Invalid JSON response from server');
    }

    if (!response.ok) {
      const errorMsg = data.message || 'An error occurred';
      console.error('❌ [api] HTTP error:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMsg,
        data: data,
      });

      // 🔴 CRITICAL: Handle authentication/authorization errors
      // 401 = Token expired or invalid
      // 403 = Forbidden (user doesn't have permission)
      if (response.status === 401 || response.status === 403) {
        console.error(`🔴 [api] Auth error detected (${response.status}). Clearing cached project data...`);
        resetProjectsData(`api_${response.status}`);
        // Don't throw yet - let caller handle the error and redirect to login
      }

      const error = new Error(errorMsg);
      (error as any).status = response.status;
      requestAudit.logRequestComplete(endpoint, method, response.status, Date.now() - startTime);
      throw error;
    }

    console.log('✅ [api] Response handled successfully');
    requestAudit.logRequestComplete(endpoint, method, response.status, Date.now() - startTime);
    return data;
  }

  // Auth endpoints
  async sendOTP(email: string): Promise<ApiResponse<SendOTPResponse>> {
    const endpoint = '/auth/send-otp';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse(response);
  }

  async verifyOTP(
    email: string,
    otp: string,
    name?: string
  ): Promise<ApiResponse<LoginResponse>> {
    const endpoint = '/auth/verify-otp';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, otp, name }),
    });

    const data = await this.handleResponse<ApiResponse<LoginResponse>>(response);

    // Save token if successful
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }

    return data;
  }

  async resendOTP(email: string): Promise<ApiResponse<SendOTPResponse>> {
    const endpoint = '/auth/resend-otp';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email }),
    });

    return this.handleResponse(response);
  }

  async register(
    email: string,
    password: string,
    name: string
  ): Promise<ApiResponse<LoginResponse>> {
    const endpoint = '/auth/register';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ email, password, name }),
    });

    const data = await this.handleResponse<ApiResponse<LoginResponse>>(response);

    // Save token if successful
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }

    return data;
  }

  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<LoginResponse>> {
    const endpoint = '/auth/login';
    requestAudit.logRequestStart(endpoint, 'POST');
    try {
      console.log('🌐 [api.login] Starting login request for:', email);
      console.log('🌐 [api.login] API URL:', `${API_URL}${endpoint}`);
      console.log('🌐 [api.login] Credentials:', { email, passwordLength: password.length });

      const requestBody = { email, password };
      console.log('📤 [api.login] Sending request body:', requestBody);

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody),
      });

      console.log('📬 [api.login] Fetch response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
      });

      const data = await this.handleResponse<ApiResponse<LoginResponse>>(response);

      console.log('✅ [api.login] Login response data:', {
        success: data.success,
        hasData: !!data.data,
        hasUser: !!data.data?.user,
        hasToken: !!data.data?.accessToken,
      });

      // Save token if successful
      if (data.data?.accessToken) {
        console.log('💾 [api.login] Saving token in API client...');
        this.setToken(data.data.accessToken);
        console.log('✅ [api.login] Token saved in API client');
      } else {
        console.warn('⚠️  [api.login] No accessToken in response data');
      }

      console.log('🎉 [api.login] Login API call complete');
      return data;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('❌ [api.login] Login request failed:', errorMsg);
      console.error('❌ [api.login] Error details:', error);
      throw error;
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    console.log('📡 [api.getProfile] INITIATING REQUEST TO /auth/me');
    console.log('📡 [api.getProfile] Headers:', this.getHeaders());

    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    console.log('📡 [api.getProfile] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    return this.handleResponse(response);
  }

  async updateUserProfile(data: { name?: string; phoneNumber?: string }): Promise<ApiResponse<User>> {
    console.log('📡 [api.updateUserProfile] INITIATING REQUEST TO /users/profile');

    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    console.log('📡 [api.updateUserProfile] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    return this.handleResponse(response);
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<ApiResponse> {
    console.log('📡 [api.updatePassword] INITIATING REQUEST TO /users/password');

    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    console.log('📡 [api.updatePassword] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    return this.handleResponse(response);
  }

  async resetPassword(newPassword: string): Promise<ApiResponse> {
    console.log('📡 [api.resetPassword] INITIATING REQUEST TO /users/reset-password');

    const response = await fetch(`${API_URL}/users/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ newPassword }),
    });

    console.log('📡 [api.resetPassword] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    });

    return this.handleResponse(response);
  }

  async logout(): Promise<ApiResponse> {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
    });

    // Clear tokens on logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.token = null;
    this.refreshToken = null;

    return this.handleResponse(response);
  }

  async refresh(): Promise<ApiResponse<LoginResponse>> {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies for refresh token
      body: JSON.stringify({
        // Send refresh token in body as fallback if cookies not available
        refreshToken: this.refreshToken,
      }),
    });

    const data = await this.handleResponse<ApiResponse<LoginResponse>>(response);

    // Save new token if successful
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }

    return data;
  }

  // Project endpoints - uses canonical Project type
  async getProjects(): Promise<ProjectListResponse> {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<ApiResponse<ProjectListResponse>>(response);

    // VALIDATE: All projects have required fields
    if (result.data?.projects) {
      if (!isValidProjectArray(result.data.projects)) {
        console.error('❌ [api] Invalid projects data from server:', result.data.projects);
        throw new Error('Server returned invalid project data');
      }
      console.log('✅ [api] Validated', result.data.projects.length, 'projects');
    }

    return result.data!;
  }

  async createProject(data: CreateProjectDTO): Promise<Project> {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<ApiResponse<Project>>(response);

    // VALIDATE: Returned project has all required fields
    if (!isValidProject(result.data)) {
      console.error('❌ [api] Invalid project data from server:', result.data);
      throw new Error('Server returned invalid project data');
    }

    // VALIDATE: New projects must have conversationCount: 0
    if (result.data.conversationCount !== 0) {
      console.warn('⚠️ [api] New project should have conversationCount: 0, got:', result.data.conversationCount);
      result.data.conversationCount = 0;
    }

    console.log('✅ [api] Created project:', result.data.id);
    return result.data;
  }

  async getProject(projectId: string): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    const result = await this.handleResponse<ApiResponse<Project>>(response);

    // VALIDATE: Returned project has all required fields
    if (!isValidProject(result.data)) {
      console.error('❌ [api] Invalid project data from server:', result.data);
      throw new Error('Server returned invalid project data');
    }

    console.log('✅ [api] Retrieved project:', result.data.id);
    return result.data;
  }

  async updateProject(
    projectId: string,
    data: UpdateProjectDTO
  ): Promise<Project> {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const result = await this.handleResponse<ApiResponse<Project>>(response);

    // VALIDATE: Returned project has all required fields
    if (!isValidProject(result.data)) {
      console.error('❌ [api] Invalid project data from server:', result.data);
      throw new Error('Server returned invalid project data');
    }

    console.log('✅ [api] Updated project:', result.data.id);
    return result.data;
  }

  async deleteProject(projectId: string): Promise<void> {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    await this.handleResponse(response);
    console.log('✅ [api] Deleted project:', projectId);
  }

  // File endpoints
  async uploadFile(projectId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/projects/${projectId}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  async getProjectFiles(projectId: string, skip = 0, take = 10) {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/files?skip=${skip}&take=${take}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  async deleteFile(projectId: string, fileId: string) {
    const response = await fetch(`${API_URL}/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  // User endpoints
  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await fetch(`${API_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`,
      },
      body: formData,
    });

    return this.handleResponse(response);
  }

  // Chat endpoints
  async getConversations(projectId: string) {
    const response = await fetch(`${API_URL}/projects/${projectId}/conversations`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async createConversation(projectId: string, title?: string) {
    const response = await fetch(`${API_URL}/projects/${projectId}/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ title }),
    });

    return this.handleResponse(response);
  }

  async getConversationMessages(projectId: string, conversationId: string) {
    console.log('📚 [getConversationMessages] Fetching messages for:', {
      projectId,
      conversationId,
    });

    const response = await fetch(
      `${API_URL}/projects/${projectId}/conversations/${conversationId}`,
      {
        method: 'GET',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  async sendMessage(projectId: string, conversationId: string, content: string) {
    console.log('📤 [sendMessage] Sending message to:', {
      projectId,
      conversationId,
      token: this.getToken() ? '***present***' : '❌ MISSING',
    });

    const response = await fetch(
      `${API_URL}/projects/${projectId}/conversations/${conversationId}/messages`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content }),
      }
    );

    return this.handleResponse(response);
  }

  async deleteConversation(projectId: string, conversationId: string) {
    const response = await fetch(
      `${API_URL}/projects/${projectId}/conversations/${conversationId}`,
      {
        method: 'DELETE',
        headers: this.getHeaders(),
      }
    );

    return this.handleResponse(response);
  }

  async testAI() {
    const response = await fetch(`${API_URL}/ai/test`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse(response);
  }

  async sendAIMessage(message: string, conversationHistory?: any[], systemPrompt?: string) {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory || [],
        systemPrompt: systemPrompt || '',
      }),
    });

    return this.handleResponse(response);
  }

  async streamAIMessage(message: string, onChunk: (chunk: string) => void, conversationHistory?: any[], systemPrompt?: string) {
    const response = await fetch(`${API_URL}/ai/stream`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory || [],
        systemPrompt: systemPrompt || '',
      }),
    });

    if (!response.ok) {
      throw new Error(`AI Stream failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          try {
            const data = JSON.parse(jsonStr);
            if (data.chunk && !data.done) {
              onChunk(data.chunk);
            }
          } catch (e) {
            console.error('Failed to parse stream chunk:', e);
          }
        }
      }
    }
  }

  clearToken() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.token = null;
    this.refreshToken = null;
  }
}

export const apiClient = new ApiClient();
