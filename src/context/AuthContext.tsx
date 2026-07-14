import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  fullName: string;
  verified: boolean;
  onboardingCompleted: boolean;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  deviceFingerprint: string;
  supabaseClient: SupabaseClient;
  login: (emailOrPhone: string, isPhone: boolean, isOtp: boolean, passwordOrOtp: string, rememberMe: boolean) => Promise<{ success: boolean; otpRequired?: boolean; userId?: string; otpCode?: string; error?: string }>;
  register: (fullName: string, emailOrPhone: string, isPhone: boolean, password: string, confirmPassword: string) => Promise<{ success: boolean; otpRequired?: boolean; userId?: string; otpCode?: string; error?: string }>;
  verifyOtpCode: (emailOrPhone: string, isPhone: boolean, otpCode: string, userId: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateOnboardingCompletedState: (completed: boolean) => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (password: string) => Promise<{ success: boolean; error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github' | 'twitter') => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Initialize Supabase Client directly from Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'mock-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  // Initialize device fingerprint
  useEffect(() => {
    let df = localStorage.getItem('ravora_device_fingerprint');
    if (!df) {
      df = 'df_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ravora_device_fingerprint', df);
    }
    setDeviceFingerprint(df);
  }, []);

  // Sync profile status from backend using the JWT token
  const syncAndGetUserProfile = async (accessToken: string, authUser: any) => {
    try {
      const response = await fetch('/v1/user/profile', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        return {
          id: authUser.id,
          email: authUser.email || authUser.phone || '',
          fullName: authUser.user_metadata?.full_name || 'Ravora Member',
          verified: !!authUser.email_confirmed_at || !!authUser.phone_confirmed_at,
          onboardingCompleted: !!data.onboardingCompleted
        };
      }
    } catch (err) {
      console.error('[AuthContext] Profile sync error:', err);
    }
    return {
      id: authUser.id,
      email: authUser.email || authUser.phone || '',
      fullName: authUser.user_metadata?.full_name || 'Ravora Member',
      verified: !!authUser.email_confirmed_at || !!authUser.phone_confirmed_at,
      onboardingCompleted: false
    };
  };

  const saveLegacySession = (session: any, onboardingCompleted: boolean) => {
    if (!session) return;
    localStorage.setItem('ravora_token', session.access_token);
    localStorage.setItem('ravora_logged_in', 'true');
    if (!localStorage.getItem('ravora_login_time')) {
      localStorage.setItem('ravora_login_time', Date.now().toString());
    }
    localStorage.setItem('ravora_email', session.user?.email || session.user?.phone || '');
    localStorage.setItem('ravora_onboarding_completed', onboardingCompleted ? 'true' : 'false');
    localStorage.setItem('ravora_remember_me', 'true');
    sessionStorage.setItem('ravora_session_active', 'true');
  };

  const clearLegacySession = () => {
    localStorage.removeItem('ravora_token');
    localStorage.removeItem('ravora_logged_in');
    localStorage.removeItem('ravora_login_time');
    localStorage.removeItem('ravora_email');
    localStorage.removeItem('ravora_onboarding_completed');
    localStorage.removeItem('ravora_remember_me');
    sessionStorage.removeItem('ravora_session_active');
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        setToken(session.access_token);
        const syncedUser = await syncAndGetUserProfile(session.access_token, session.user);
        setUser(syncedUser);
        saveLegacySession(session, syncedUser.onboardingCompleted);
      } else {
        setToken(null);
        setUser(null);
        clearLegacySession();
      }
      setLoading(false);
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Supabase Auth Event]', event);
      if (session) {
        setToken(session.access_token);
        const syncedUser = await syncAndGetUserProfile(session.access_token, session.user);
        setUser(syncedUser);
        saveLegacySession(session, syncedUser.onboardingCompleted);
      } else {
        setToken(null);
        setUser(null);
        clearLegacySession();
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setToken(session.access_token);
        const syncedUser = await syncAndGetUserProfile(session.access_token, session.user);
        setUser(syncedUser);
        saveLegacySession(session, syncedUser.onboardingCompleted);
      } else {
        setToken(null);
        setUser(null);
        clearLegacySession();
      }
    } catch (err) {
      console.error('[AuthContext] checkAuth error:', err);
    }
  };

  const login = async (
    emailOrPhone: string,
    isPhone: boolean,
    isOtp: boolean,
    passwordOrOtp: string,
    rememberMe: boolean
  ) => {
    try {
      localStorage.setItem('ravora_remember_me', rememberMe ? 'true' : 'false');
      if (isOtp) {
        const { data, error } = await supabase.auth.signInWithOtp(
          isPhone ? { phone: emailOrPhone } : { email: emailOrPhone }
        );
        if (error) throw error;
        return {
          success: true,
          otpRequired: true,
          userId: (data as any)?.user?.id,
          otpCode: (data as any)?.otpCode
        };
      } else {
        const credentials = isPhone
          ? { phone: emailOrPhone, password: passwordOrOtp }
          : { email: emailOrPhone, password: passwordOrOtp };

        const { data, error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
        return {
          success: true,
          otpRequired: (data as any)?.otpRequired || false,
          userId: data.user?.id,
          otpCode: (data as any)?.otpCode
        };
      }
    } catch (err: any) {
      console.error('[AuthContext] Login error:', err);
      let errMsg = 'An error occurred during sign in.';
      if (err) {
        if (typeof err === 'string') {
          errMsg = err;
        } else {
          errMsg = err.message || err.error_description || (err.error && (typeof err.error === 'string' ? err.error : err.error.message)) || '';
          if (!errMsg || errMsg === '{}') {
            errMsg = `${err.name || 'Error'}: ${err.status || err.statusCode || ''} (${String(err)})`;
          }
        }
      }
      return { success: false, error: errMsg };
    }
  };

  const register = async (
    fullName: string,
    emailOrPhone: string,
    isPhone: boolean,
    password: string,
    confirmPassword: string
  ) => {
    if (password !== confirmPassword) {
      return { success: false, error: 'Passwords do not match.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp(
        isPhone
          ? { phone: emailOrPhone, password, options: { data: { full_name: fullName } } }
          : { email: emailOrPhone, password, options: { data: { full_name: fullName } } }
      );
      if (error) throw error;

      const isConfirmed = !!data.user?.email_confirmed_at || !!data.user?.phone_confirmed_at;
      return {
        success: true,
        otpRequired: !isConfirmed,
        userId: data.user?.id,
        otpCode: (data as any)?.otpCode
      };
    } catch (err: any) {
      console.error('[AuthContext] Registration error:', err);
      let errMsg = 'An error occurred during registration.';
      if (err) {
        if (typeof err === 'string') {
          errMsg = err;
        } else {
          errMsg = err.message || err.error_description || (err.error && (typeof err.error === 'string' ? err.error : err.error.message)) || '';
          if (!errMsg || errMsg === '{}') {
            errMsg = `${err.name || 'Error'}: ${err.status || err.statusCode || ''} (${String(err)})`;
          }
        }
      }
      return { success: false, error: errMsg };
    }
  };

  const verifyOtpCode = async (
    emailOrPhone: string,
    isPhone: boolean,
    otpCode: string,
    _userId: string,
    rememberMe = false
  ) => {
    try {
      localStorage.setItem('ravora_remember_me', rememberMe ? 'true' : 'false');
      const { error } = await supabase.auth.verifyOtp(
        isPhone
          ? { phone: emailOrPhone, token: otpCode, type: 'sms' }
          : { email: emailOrPhone, token: otpCode, type: 'signup' }
      );
      if (error) {
        if (!isPhone) {
          // Fallback to magiclink verification
          const fallback = await supabase.auth.verifyOtp({
            email: emailOrPhone,
            token: otpCode,
            type: 'magiclink'
          });
          if (fallback.error) throw fallback.error;
          return { success: true };
        }
        throw error;
      }
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] OTP verification error:', err);
      return { success: false, error: err.message || 'OTP verification failed.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext] Sign out error:', err);
    } finally {
      setToken(null);
      setUser(null);
      clearLegacySession();
    }
  };

  const updateOnboardingCompletedState = (completed: boolean) => {
    if (user) {
      setUser(prev => prev ? { ...prev, onboardingCompleted: completed } : null);
      localStorage.setItem('ravora_onboarding_completed', completed ? 'true' : 'false');
    }
  };

  const forgotPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth?mode=reset`
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Forgot password error:', err);
      return { success: false, error: err.message || 'Failed to send recovery email.' };
    }
  };

  const resetPassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] Reset password error:', err);
      return { success: false, error: err.message || 'Failed to reset password.' };
    }
  };

  const signInWithOAuth = async (provider: 'google' | 'github' | 'twitter') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth`
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('[AuthContext] OAuth error:', err);
      return { success: false, error: err.message || 'OAuth sign in failed.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      token,
      user,
      loading,
      deviceFingerprint,
      supabaseClient: supabase,
      login,
      register,
      verifyOtpCode,
      logout,
      checkAuth,
      updateOnboardingCompletedState,
      forgotPassword,
      resetPassword,
      signInWithOAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};
