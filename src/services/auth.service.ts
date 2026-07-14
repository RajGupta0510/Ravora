import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Client Warning] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing from environment. Using local endpoint redirects instead.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const authService = {
  // Sign up with Email + Password
  async signUpWithEmail(email: string, password: string, fullName: string) {
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
  },

  // Sign up with Phone + Password
  async signUpWithPhone(phone: string, password: string, fullName: string) {
    return await supabase.auth.signUp({
      phone,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
  },

  // Sign in with Email/Phone + Password
  async signInWithPassword({ email, phone, password }: { email?: string; phone?: string; password?: string }) {
    if (email) {
      return await supabase.auth.signInWithPassword({ email, password: password || '' });
    } else if (phone) {
      return await supabase.auth.signInWithPassword({ phone, password: password || '' });
    }
    return { data: { user: null, session: null }, error: new Error('Email or Phone required for sign in.') as any };
  },

  // Send Email OTP / Phone OTP
  async sendOtp({ email, phone }: { email?: string; phone?: string }) {
    if (email) {
      return await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true
        }
      });
    } else if (phone) {
      return await supabase.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true
        }
      });
    }
    return { data: { user: null, session: null }, error: new Error('Email or Phone required to send OTP.') as any };
  },

  // Verify OTP
  async verifyOtp({ email, phone, token, type }: { email?: string; phone?: string; token: string; type: any }) {
    if (email) {
      return await supabase.auth.verifyOtp({ email, token, type });
    } else if (phone) {
      return await supabase.auth.verifyOtp({ phone, token, type });
    }
    return { data: { user: null, session: null }, error: new Error('Email or Phone required for OTP verification.') as any };
  },

  // Resend OTP
  async resendOtp({ email, phone, type }: { email?: string; phone?: string; type: any }) {
    if (email) {
      return await supabase.auth.resend({
        type,
        email
      });
    } else if (phone) {
      return await supabase.auth.resend({
        type,
        phone
      });
    }
    return { data: null, error: new Error('Email or Phone required to resend OTP.') as any };
  },

  // Social Logins (OAuth)
  async signInWithOAuth(provider: 'google' | 'github' | 'apple') {
    return await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/app/dashboard.html`
      }
    });
  },

  // Reset password requests
  async resetPasswordForEmail(email: string) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/`
    });
  },

  // Update password
  async updatePassword(password: string) {
    return await supabase.auth.updateUser({ password });
  },

  // Sign out
  async signOut() {
    return await supabase.auth.signOut();
  },

  // Get active session
  async getSession() {
    return await supabase.auth.getSession();
  },

  // Get active user
  async getUser() {
    return await supabase.auth.getUser();
  }
};
