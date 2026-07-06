import React, { createContext, useContext, useState, useEffect } from 'react';

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
  login: (emailOrPhone: string, isPhone: boolean, isOtp: boolean, passwordOrOtp: string, rememberMe: boolean) => Promise<{ success: boolean; otpRequired?: boolean; userId?: string; channel?: string; destination?: string; error?: string }>;
  register: (fullName: string, emailOrPhone: string, isPhone: boolean, password: string, confirmPassword: string) => Promise<{ success: boolean; otpRequired: boolean; userId: string; channel: string; destination: string; error?: string }>;
  verifyOtpCode: (emailOrPhone: string, isPhone: boolean, otpCode: string, userId: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateOnboardingCompletedState: (completed: boolean) => void;
  socialLoginSuccess: (token: string, email: string, onboardingCompleted: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>('');

  const API_BASE = '/v1';

  // Initialize device fingerprint
  useEffect(() => {
    let df = localStorage.getItem('ravora_device_fingerprint');
    if (!df) {
      df = 'df_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('ravora_device_fingerprint', df);
    }
    setDeviceFingerprint(df);
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem('ravora_token') || sessionStorage.getItem('ravora_token');
      const loggedIn = localStorage.getItem('ravora_logged_in') === 'true';
      
      // Remember Me / session storage alignment
      const rememberMe = localStorage.getItem('ravora_remember_me') === 'true';
      const sessionActive = sessionStorage.getItem('ravora_session_active') === 'true';
      const sessionValid = rememberMe || sessionActive;

      if (!storedToken || !loggedIn || !sessionValid) {
        logout();
        setLoading(false);
        return;
      }

      const res = await fetch(`${API_BASE}/user/profile`, {
        headers: {
          'Authorization': `Bearer ${storedToken}`
        }
      });

      if (res.ok) {
        const profileData = await res.json();
        setToken(storedToken);
        setUser({
          id: profileData.id || 'user_id',
          email: profileData.email || localStorage.getItem('ravora_email') || 'user@ravora.ai',
          fullName: profileData.fullName || 'User',
          verified: true,
          onboardingCompleted: profileData.onboardingCompleted
        });
      } else {
        // Token expired/invalid
        logout();
      }
    } catch (err) {
      console.error('[Auth check error]', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only check auth after deviceFingerprint is initialized
    if (deviceFingerprint) {
      checkAuth();
    }
  }, [deviceFingerprint]);

  const login = async (
    emailOrPhone: string,
    isPhone: boolean,
    isOtp: boolean,
    passwordOrOtp: string,
    rememberMe: boolean
  ) => {
    try {
      const payload: any = {
        deviceFingerprint,
        rememberMe
      };

      if (isPhone) {
        payload.mobile = emailOrPhone;
      } else {
        payload.email = emailOrPhone;
      }

      if (isOtp) {
        payload.otpCode = passwordOrOtp;
      } else {
        payload.password = passwordOrOtp;
      }

      const endpoint = isOtp ? '/auth/otp/verify' : '/auth/login';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'Login failed.' };
      }

      if (data.otpRequired) {
        return {
          success: true,
          otpRequired: true,
          destination: data.destination,
          channel: data.channel,
          userId: data.userId
        };
      }

      // Save session
      const userToken = data.token;
      if (!userToken) return { success: false, error: 'Token missing from response.' };

      if (rememberMe) {
        localStorage.setItem('ravora_token', userToken);
        localStorage.setItem('ravora_remember_me', 'true');
      } else {
        sessionStorage.setItem('ravora_token', userToken);
        localStorage.setItem('ravora_remember_me', 'false');
      }
      
      localStorage.setItem('ravora_logged_in', 'true');
      localStorage.setItem('ravora_login_time', Date.now().toString());
      localStorage.setItem('ravora_email', emailOrPhone);
      sessionStorage.setItem('ravora_session_active', 'true');

      setToken(userToken);
      setUser({
        id: data.user?.id || 'user_id',
        email: emailOrPhone,
        fullName: data.user?.full_name || 'Ravora Member',
        verified: true,
        onboardingCompleted: data.user?.onboardingCompleted ?? false
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during login.' };
    }
  };

  const register = async (
    fullName: string,
    emailOrPhone: string,
    isPhone: boolean,
    password: string,
    confirmPassword: string
  ) => {
    try {
      const payload: any = {
        fullName,
        password,
        confirmPassword,
        acceptTerms: true
      };

      if (isPhone) {
        payload.mobileNumber = emailOrPhone;
      } else {
        payload.email = emailOrPhone;
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, otpRequired: false, userId: '', channel: '', destination: '', error: data.error || 'Registration failed.' };
      }

      return {
        success: true,
        otpRequired: true,
        userId: data.userId,
        channel: data.channel,
        destination: data.destination
      };
    } catch (err: any) {
      return { success: false, otpRequired: false, userId: '', channel: '', destination: '', error: err.message || 'An error occurred during registration.' };
    }
  };

  const verifyOtpCode = async (
    emailOrPhone: string,
    isPhone: boolean,
    otpCode: string,
    userId: string,
    rememberMe = false
  ) => {
    try {
      const payload: any = {
        userId,
        otpCode,
        deviceFingerprint,
        rememberMe
      };

      if (isPhone) {
        payload.mobileNumber = emailOrPhone;
      } else {
        payload.email = emailOrPhone;
      }

      const res = await fetch(`${API_BASE}/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'OTP verification failed.' };
      }

      const userToken = data.token;
      if (!userToken) return { success: false, error: 'Token missing from response.' };

      if (rememberMe) {
        localStorage.setItem('ravora_token', userToken);
        localStorage.setItem('ravora_remember_me', 'true');
      } else {
        sessionStorage.setItem('ravora_token', userToken);
        localStorage.setItem('ravora_remember_me', 'false');
      }
      
      localStorage.setItem('ravora_logged_in', 'true');
      localStorage.setItem('ravora_login_time', Date.now().toString());
      localStorage.setItem('ravora_email', emailOrPhone);
      sessionStorage.setItem('ravora_session_active', 'true');

      setToken(userToken);
      setUser({
        id: data.user?.id || userId,
        email: emailOrPhone,
        fullName: data.user?.full_name || 'Ravora Member',
        verified: true,
        onboardingCompleted: data.user?.onboardingCompleted ?? false
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred during OTP verification.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('ravora_token');
    localStorage.removeItem('ravora_logged_in');
    localStorage.removeItem('ravora_login_time');
    localStorage.removeItem('ravora_email');
    localStorage.removeItem('ravora_onboarding_completed');
    localStorage.removeItem('ravora_remember_me');
    sessionStorage.removeItem('ravora_session_active');
    setToken(null);
    setUser(null);
  };

  const updateOnboardingCompletedState = (completed: boolean) => {
    if (user) {
      setUser({
        ...user,
        onboardingCompleted: completed
      });
      localStorage.setItem('ravora_onboarding_completed', completed ? 'true' : 'false');
    }
  };

  const socialLoginSuccess = async (token: string, email: string, onboardingCompleted: boolean) => {
    localStorage.setItem('ravora_token', token);
    localStorage.setItem('ravora_logged_in', 'true');
    localStorage.setItem('ravora_login_time', Date.now().toString());
    localStorage.setItem('ravora_email', email);
    localStorage.setItem('ravora_remember_me', 'true');
    sessionStorage.setItem('ravora_session_active', 'true');

    setToken(token);
    setUser({
      id: 'oauth_user',
      email,
      fullName: 'Ravora Member',
      verified: true,
      onboardingCompleted
    });
    
    await checkAuth();
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, deviceFingerprint, login, register, verifyOtpCode, logout, checkAuth, updateOnboardingCompletedState, socialLoginSuccess }}>
      {children}
    </AuthContext.Provider>
  );
};
