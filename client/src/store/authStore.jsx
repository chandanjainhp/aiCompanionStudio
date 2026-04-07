import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api';
import { resetProjectsData } from '@/lib/appStateReset';
import { cleanupExpiredTokens } from '@/lib/tokenUtils';

// GLOBAL COUNTER FOR DETECTING INFINITE INITIALIZATION
let initializeAuthCallCount = 0;
const INIT_CALL_LIMIT = 3;
export const useAuthStore = create()(persist((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  accessToken: null,
  loginMethod: null,
  otpMode: null,
  otpEmail: null,
  otpName: null,
  otpSent: false,
  registerName: null,
  registerEmail: null,
  registerPassword: null,
  registerOtpSent: false,
  _isHydrated: false,
  login: async (email, password) => {
    set({
      isLoading: true
    });
    try {
      console.log('🔐 [login] Starting login for:', email);
      console.log('🔐 [login] Email type:', typeof email, 'Password type:', typeof password);

      // Validate input
      if (!email || !password) {
        throw new Error(`Missing credentials: email=${!!email}, password=${!!password}`);
      }
      console.log('📡 [login] Sending login request to backend...');
      const response = await apiClient.login(email, password);
      console.log('📦 [login] Response received from backend:', {
        success: response.success,
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        hasToken: !!response.data?.accessToken,
        responseKeys: Object.keys(response)
      });
      if (!response.success) {
        const errorMsg = response.message || 'Login failed';
        console.error('❌ [login] Response success is false:', errorMsg);
        throw new Error(errorMsg);
      }
      if (!response.data) {
        console.error('❌ [login] No data in response. Response:', response);
        throw new Error('Invalid server response: missing data object');
      }
      if (!response.data.user) {
        console.error('❌ [login] No user in response.data. Available keys:', Object.keys(response.data));
        throw new Error('Invalid server response: missing user data');
      }
      if (!response.data.accessToken) {
        console.error('❌ [login] No accessToken in response.data. Available keys:', Object.keys(response.data));
        throw new Error('Invalid server response: missing accessToken');
      }
      const userData = response.data.user;
      const token = response.data.accessToken;
      console.log('✅ [login] Response structure valid');
      console.log('👤 [login] User data:', {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        hasAvatarUrl: !!userData.avatarUrl
      });

      // Validate user data
      if (!userData.id) {
        console.error('❌ [login] User ID missing:', userData);
        throw new Error('Invalid user data: missing ID');
      }
      if (!userData.email) {
        console.error('❌ [login] User email missing:', userData);
        throw new Error('Invalid user data: missing email');
      }
      console.log('✅ [login] User data validated');
      console.log('🔑 [login] Token length:', token.length, 'First 20 chars:', token.substring(0, 20) + '...');
      const user = {
        id: userData.id,
        email: userData.email,
        name: userData.name || '',
        avatarUrl: userData.avatarUrl,
        createdAt: userData.createdAt
      };

      // Persist token to localStorage BEFORE updating state
      console.log('💾 [login] Saving token to localStorage...');
      localStorage.setItem('accessToken', token);
      const saved = localStorage.getItem('accessToken');
      if (saved !== token) {
        console.error('❌ [login] Token not saved correctly to localStorage!');
        throw new Error('Failed to save token to localStorage');
      }
      console.log('✅ [login] Token verified in localStorage');

      // Update auth state
      console.log('🔄 [login] Updating Zustand state...');
      set({
        user,
        accessToken: token,
        isAuthenticated: true,
        isLoading: false,
        loginMethod: 'password',
        // STRICT: Track password login
        otpMode: null,
        // STRICT: Clear OTP state
        otpSent: false,
        otpEmail: null,
        otpName: null
      });
      console.log('✅ [login] Zustand state updated successfully');
      console.log('🎉 [login] LOGIN COMPLETE for user:', email);
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('❌ [login] ERROR DURING LOGIN:', errorMessage);
      console.error('❌ [login] Error object:', error);
      console.error('❌ [login] Error stack:', error instanceof Error ? error.stack : 'no stack');

      // Clear any partial state
      console.log('🧹 [login] Clearing auth state...');
      localStorage.removeItem('accessToken');
      set({
        isLoading: false,
        isAuthenticated: false,
        user: null,
        accessToken: null,
        loginMethod: null,
        otpMode: null,
        otpSent: false,
        otpEmail: null,
        otpName: null
      });
      console.log('🧹 [login] Auth state cleared');
      throw error;
    }
  },
  register: async (name, email, password) => {
    set({
      isLoading: true
    });
    try {
      const response = await apiClient.register(email, password, name);
      if (response.success && response.data) {
        // Backend returns { user: {...}, accessToken: "..." }
        const userData = response.data.user || response.data;
        const user = {
          id: userData.id || '',
          email: userData.email,
          name: userData.name || name,
          createdAt: userData.createdAt
        };
        set({
          user,
          accessToken: response.data.accessToken,
          isAuthenticated: true,
          isLoading: false,
          otpSent: false,
          otpEmail: null
        });
        console.log('✅ User registered successfully');
      }
    } catch (error) {
      set({
        isLoading: false
      });
      throw error;
    }
  },
  sendOTP: async (email, mode) => {
    set({
      isLoading: true
    });
    try {
      console.log('📡 [sendOTP] Sending OTP for mode:', mode, 'email:', email);
      const response = await apiClient.sendOTP(email);
      if (response.success) {
        console.log('✅ [sendOTP] OTP sent successfully. Setting state for mode:', mode);
        set({
          loginMethod: mode === 'login' ? 'otp' : null,
          // Track loginMethod for login mode
          otpMode: mode,
          otpSent: true,
          otpEmail: email,
          isLoading: false
        });
      }
      return response;
    } catch (error) {
      console.error('❌ [sendOTP] Failed to send OTP:', error);
      set({
        isLoading: false
      });
      throw error;
    }
  },
  verifyOTP: async (email, otp, mode, name) => {
    set({
      isLoading: true
    });
    try {
      const response = await apiClient.verifyOTP(email, otp, name);
      if (response.success && response.data) {
        const user = {
          id: response.data.user?.id || '',
          email: response.data.user?.email || email,
          name: response.data.user?.name || name || '',
          createdAt: response.data.user?.createdAt
        };
        if (mode === 'login' || mode === 'reset_password') {
          set({
            user,
            accessToken: response.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            loginMethod: null,
            otpMode: null,
            otpSent: false,
            otpEmail: null,
            otpName: null
          });
        } else if (mode === 'register') {
          // For registration, also log the user in
          set({
            user,
            accessToken: response.data.accessToken,
            isAuthenticated: true,
            isLoading: false,
            registerName: null,
            registerEmail: null,
            registerPassword: null,
            registerOtpSent: false,
            otpMode: null,
            otpSent: false,
            otpEmail: null,
            otpName: null,
            loginMethod: null
          });
        } else {
          set({
            isLoading: false,
            otpMode: null,
            otpSent: false,
            otpEmail: null,
            otpName: null
          });
        }
      }
    } catch (error) {
      set({
        isLoading: false
      });
      throw error;
    }
  },
  verifyRegistrationOTP: async (email, otp) => {
    set({
      isLoading: true
    });
    try {
      const state = get();
      const name = state.registerName;
      const password = state.registerPassword;
      if (!name || !password) {
        throw new Error('Registration data missing. Please start registration again.');
      }

      // Call verify OTP - backend will create user and return token
      const response = await apiClient.verifyOTP(email, otp, name);
      if (response.success && response.data) {
        // Log user in with returned credentials
        const user = {
          id: response.data.user?.id || '',
          email: response.data.user?.email || email,
          name: response.data.user?.name || name || '',
          createdAt: response.data.user?.createdAt
        };

        set({
          user,
          accessToken: response.data.accessToken,
          isAuthenticated: true,
          registerName: null,
          registerEmail: null,
          registerPassword: null,
          registerOtpSent: false,
          isLoading: false
        });
      }
    } catch (error) {
      set({
        isLoading: false
      });
      throw error;
    }
  },
  resendOTP: async email => {
    set({
      isLoading: true
    });
    try {
      const response = await apiClient.resendOTP(email);
      if (response.success) {
        set({
          isLoading: false,
          otpEmail: email
        });
      }
      return response;
    } catch (error) {
      set({
        isLoading: false
      });
      throw error;
    }
  },
  resetPassword: async newPassword => {
    set({
      isLoading: true
    });
    try {
      const response = await apiClient.resetPassword(newPassword);
      if (response.success) {
        console.log('✅ Password reset successfully');
      }
      set({
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false
      });
      throw error;
    }
  },
  sendRegistrationOTP: async (name, email, password) => {
    set({
      isLoading: true
    });
    try {
      // Send OTP via email first
      await apiClient.sendOTP(email, name);

      // Set all state atomically AFTER OTP is sent
      // Set BOTH registration state AND login OTP state so route guard passes
      set({
        // Registration state (for verifyRegistrationOTP)
        registerName: name,
        registerEmail: email,
        registerPassword: password,
        registerOtpSent: true,
        // Login OTP state (for route guard to allow access to /verify-otp)
        otpMode: 'register',
        otpEmail: email,
        otpName: name,
        otpSent: true,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false
      });
      throw error;
    }
  },
  clearOTPState: () => {
    set({
      loginMethod: null,
      otpMode: null,
      otpSent: false,
      otpEmail: null,
      otpName: null
    });
  },
  clearRegistrationState: () => {
    set({
      registerName: null,
      registerEmail: null,
      registerPassword: null,
      registerOtpSent: false
    });
  },
  logout: async () => {
    set({
      isLoading: true
    });
    try {
      await apiClient.logout();
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Still complete logout even if API call fails
    } finally {
      // Clear ALL auth state immediately
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        isLoading: false,
        loginMethod: null,
        otpMode: null,
        otpSent: false,
        otpEmail: null,
        otpName: null,
        registerName: null,
        registerEmail: null,
        registerPassword: null,
        registerOtpSent: false
      });

      // 🔴 CRITICAL: Also clear all project/conversation data on logout
      resetProjectsData('user_logout');
      console.log('✅ User logged out successfully - all data cleared');
    }
  },
  setUser: user => {
    set({
      user,
      isAuthenticated: user !== null
    });
  },
  setLoginMethod: method => {
    console.log('🔄 [setLoginMethod] Changing login method to:', method);
    set({
      loginMethod: method
    });
  },
  refreshAccessToken: async () => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      if (!storedToken) {
        console.log('⏭️ [refreshAccessToken] No stored token, skipping refresh');
        return;
      }
      console.log('🔄 [refreshAccessToken] Attempting to refresh token...');
      const response = await apiClient.refresh();
      if (response.success && response.data) {
        console.log('✅ [refreshAccessToken] Token refreshed successfully');
        set({
          accessToken: response.data.accessToken,
          user: response.data.user,
          isAuthenticated: true
        });
      } else {
        console.warn('⚠️ [refreshAccessToken] Invalid refresh response');
        localStorage.removeItem('accessToken');
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null
        });
      }
    } catch (error) {
      console.warn('⚠️ [refreshAccessToken] Token refresh failed:', error instanceof Error ? error.message : error);
      // Clear auth state on refresh failure - will trigger login redirect
      localStorage.removeItem('accessToken');
      set({
        user: null,
        isAuthenticated: false,
        accessToken: null
      });
    }
  },
  initializeAuth: async () => {
    initializeAuthCallCount++;
    console.log(`🔐 [initializeAuth] CALL #${initializeAuthCallCount}`);
    if (initializeAuthCallCount > INIT_CALL_LIMIT) {
      console.error(`❌ [initializeAuth] INFINITE LOOP DETECTED! Called ${initializeAuthCallCount} times`);
      throw new Error('Auth initialization infinite loop detected');
    }
    set({
      isLoading: true
    });
    try {
      // 🧹 CRITICAL: Clean up expired tokens on app startup
      console.log('🔐 [initializeAuth] Checking for expired tokens...');
      cleanupExpiredTokens(); // This will remove expired tokens from localStorage

      // CRITICAL: Check for persisted token
      const storedToken = localStorage.getItem('accessToken');
      console.log(`🔐 [initializeAuth] Call #${initializeAuthCallCount}: Stored token exists?`, !!storedToken);
      if (!storedToken) {
        console.log('🔓 [initializeAuth] No stored token found. User is unauthenticated.');
        set({
          isLoading: false,
          isAuthenticated: false,
          user: null,
          accessToken: null
        });
        return;
      }
      console.log('🔐 [initializeAuth] Token found. Validating with backend...');
      try {
        // Validate token by fetching user profile with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        console.log(`🔐 [initializeAuth] Call #${initializeAuthCallCount}: Making getProfile request...`);
        const response = await apiClient.getProfile();
        clearTimeout(timeoutId);
        console.log(`🔐 [initializeAuth] Call #${initializeAuthCallCount}: getProfile response:`, {
          success: response.success,
          hasData: !!response.data
        });
        if (response.success && response.data) {
          console.log('✅ [initializeAuth] Token validated. User authenticated:', response.data.email);
          set({
            user: response.data,
            isAuthenticated: true,
            accessToken: storedToken,
            isLoading: false
          });
        } else {
          console.warn('⚠️ [initializeAuth] Invalid response from getProfile');
          localStorage.removeItem('accessToken');
          set({
            user: null,
            isAuthenticated: false,
            accessToken: null,
            isLoading: false
          });
        }
      } catch (profileError) {
        console.warn('⚠️ [initializeAuth] Profile fetch failed:', profileError instanceof Error ? profileError.message : profileError);
        // On first load without valid token, just continue without auth
        localStorage.removeItem('accessToken');
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('❌ [initializeAuth] Critical error:', error instanceof Error ? error.message : error);
      localStorage.removeItem('accessToken');
      set({
        user: null,
        isAuthenticated: false,
        accessToken: null,
        isLoading: false
      });
    }
  }
}), {
  name: 'auth-storage',
  onRehydrateStorage: () => state => {
    if (state) {
      // Mark store as hydrated after localStorage data is loaded
      state._isHydrated = true;
      console.log('✅ [authStore] Rehydrated from localStorage');
    }
  },
  partialize: state => ({
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    accessToken: state.accessToken,
    // Do NOT persist loginMethod - fresh selection each session
    // Do NOT persist OTP state - must request new OTP each session
    // Persist registration OTP state for form recovery
    registerName: state.registerName,
    registerEmail: state.registerEmail,
    registerPassword: state.registerPassword,
    registerOtpSent: state.registerOtpSent
  })
}));
