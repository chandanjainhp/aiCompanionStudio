// src/lib/api.ts
import { requestAudit } from './request-audit';
import { resetProjectsData } from './appStateReset';
import { isValidProject, isValidProjectArray } from '@/types/project';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
class ApiClient {
  token = null;
  refreshToken = null;
  constructor() {
    // Get token from localStorage on init
    this.token = localStorage.getItem('accessToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }
  setToken(token) {
    this.token = token;
    localStorage.setItem('accessToken', token);
  }
  setRefreshToken(token) {
    this.refreshToken = token;
    localStorage.setItem('refreshToken', token);
  }
  getToken() {
    return this.token || localStorage.getItem('accessToken');
  }
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }
  getFetchOptions(method, body) {
    return {
      method,
      headers: this.getHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    };
  }
  async handleResponse(response) {
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
        cors: response.headers.get('access-control-allow-origin')
      }
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
        data: data
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
      error.status = response.status;
      requestAudit.logRequestComplete(endpoint, method, response.status, Date.now() - startTime);
      throw error;
    }
    console.log('✅ [api] Response handled successfully');
    requestAudit.logRequestComplete(endpoint, method, response.status, Date.now() - startTime);
    return data;
  }

  // Auth endpoints
  async sendOTP(email) {
    const endpoint = '/auth/send-otp';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email
      })
    });
    return this.handleResponse(response);
  }
  async verifyOTP(email, otp, name) {
    const endpoint = '/auth/verify-otp';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        otp,
        name
      })
    });
    const data = await this.handleResponse(response);

    // Save token if successful
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }
    return data;
  }
  async resendOTP(email) {
    const endpoint = '/auth/resend-otp';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email
      })
    });
    return this.handleResponse(response);
  }
  async register(email, password, name) {
    const endpoint = '/auth/register';
    requestAudit.logRequestStart(endpoint, 'POST');
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        email,
        password,
        name
      })
    });
    const data = await this.handleResponse(response);

    // Save token if successful
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }
    return data;
  }
  async login(email, password) {
    const endpoint = '/auth/login';
    requestAudit.logRequestStart(endpoint, 'POST');
    try {
      console.log('🌐 [api.login] Starting login request for:', email);
      console.log('🌐 [api.login] API URL:', `${API_URL}${endpoint}`);
      console.log('🌐 [api.login] Credentials:', {
        email,
        passwordLength: password.length
      });
      const requestBody = {
        email,
        password
      };
      console.log('📤 [api.login] Sending request body:', requestBody);
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });
      console.log('📬 [api.login] Fetch response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });
      const data = await this.handleResponse(response);
      console.log('✅ [api.login] Login response data:', {
        success: data.success,
        hasData: !!data.data,
        hasUser: !!data.data?.user,
        hasToken: !!data.data?.accessToken
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
  async getProfile() {
    console.log('📡 [api.getProfile] INITIATING REQUEST TO /auth/me');
    console.log('📡 [api.getProfile] Headers:', this.getHeaders());
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    console.log('📡 [api.getProfile] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    return this.handleResponse(response);
  }
  async updateUserProfile(data) {
    console.log('📡 [api.updateUserProfile] INITIATING REQUEST TO /users/profile');
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    console.log('📡 [api.updateUserProfile] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    return this.handleResponse(response);
  }
  async updatePassword(currentPassword, newPassword) {
    console.log('📡 [api.updatePassword] INITIATING REQUEST TO /users/password');
    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify({
        currentPassword,
        newPassword
      })
    });
    console.log('📡 [api.updatePassword] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    return this.handleResponse(response);
  }
  async resetPassword(newPassword) {
    console.log('📡 [api.resetPassword] INITIATING REQUEST TO /users/reset-password');
    const response = await fetch(`${API_URL}/users/reset-password`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        newPassword
      })
    });
    console.log('📡 [api.resetPassword] RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });
    return this.handleResponse(response);
  }
  async logout() {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include'
    });

    // Clear tokens on logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.token = null;
    this.refreshToken = null;
    return this.handleResponse(response);
  }
  async refresh() {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include',
      // Include cookies for refresh token
      body: JSON.stringify({
        // Send refresh token in body as fallback if cookies not available
        refreshToken: this.refreshToken
      })
    });
    const data = await this.handleResponse(response);

    // Save new token if successful
    if (data.data?.accessToken) {
      this.setToken(data.data.accessToken);
    }
    return data;
  }

  // Project endpoints - uses canonical Project type
  async getProjects() {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const result = await this.handleResponse(response);

    // VALIDATE: All projects have required fields
    if (result.data?.projects) {
      if (!isValidProjectArray(result.data.projects)) {
        console.error('❌ [api] Invalid projects data from server:', result.data.projects);
        throw new Error('Server returned invalid project data');
      }
      console.log('✅ [api] Validated', result.data.projects.length, 'projects');
    }
    return result.data;
  }
  async createProject(data) {
    const response = await fetch(`${API_URL}/projects`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await this.handleResponse(response);

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
  async getProject(projectId) {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    const result = await this.handleResponse(response);

    // VALIDATE: Returned project has all required fields
    if (!isValidProject(result.data)) {
      console.error('❌ [api] Invalid project data from server:', result.data);
      throw new Error('Server returned invalid project data');
    }
    console.log('✅ [api] Retrieved project:', result.data.id);
    return result.data;
  }
  async updateProject(projectId, data) {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data)
    });
    const result = await this.handleResponse(response);

    // VALIDATE: Returned project has all required fields
    if (!isValidProject(result.data)) {
      console.error('❌ [api] Invalid project data from server:', result.data);
      throw new Error('Server returned invalid project data');
    }
    console.log('✅ [api] Updated project:', result.data.id);
    return result.data;
  }
  async deleteProject(projectId) {
    const response = await fetch(`${API_URL}/projects/${projectId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    await this.handleResponse(response);
    console.log('✅ [api] Deleted project:', projectId);
  }

  // File endpoints
  async uploadFile(projectId, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_URL}/projects/${projectId}/files`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }
  async getProjectFiles(projectId, skip = 0, take = 10) {
    const response = await fetch(`${API_URL}/projects/${projectId}/files?skip=${skip}&take=${take}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
  async deleteFile(projectId, fileId) {
    const response = await fetch(`${API_URL}/projects/${projectId}/files/${fileId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }

  // User endpoints
  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await fetch(`${API_URL}/users/avatar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.getToken()}`
      },
      body: formData
    });
    return this.handleResponse(response);
  }

  // Chat endpoints
  async getConversations(projectId) {
    const response = await fetch(`${API_URL}/projects/${projectId}/conversations`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
  async createConversation(projectId, title) {
    const response = await fetch(`${API_URL}/projects/${projectId}/conversations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        title
      })
    });
    return this.handleResponse(response);
  }
  async getConversationMessages(projectId, conversationId) {
    console.log('📚 [getConversationMessages] Fetching messages for:', {
      projectId,
      conversationId
    });
    const response = await fetch(`${API_URL}/projects/${projectId}/conversations/${conversationId}`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
  async sendMessage(projectId, conversationId, content) {
    console.log('📤 [sendMessage] Sending message to:', {
      projectId,
      conversationId,
      token: this.getToken() ? '***present***' : '❌ MISSING'
    });
    const response = await fetch(`${API_URL}/projects/${projectId}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        content
      })
    });
    return this.handleResponse(response);
  }
  async deleteConversation(projectId, conversationId) {
    const response = await fetch(`${API_URL}/projects/${projectId}/conversations/${conversationId}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
  async testAI() {
    const response = await fetch(`${API_URL}/ai/test`, {
      method: 'GET',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
  async sendAIMessage(message, conversationHistory, systemPrompt) {
    const response = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory || [],
        systemPrompt: systemPrompt || ''
      })
    });
    return this.handleResponse(response);
  }
  async streamAIMessage(message, onChunk, conversationHistory, systemPrompt) {
    const response = await fetch(`${API_URL}/ai/stream`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        message,
        conversationHistory: conversationHistory || [],
        systemPrompt: systemPrompt || ''
      })
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
      const {
        done,
        value
      } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, {
        stream: true
      });
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