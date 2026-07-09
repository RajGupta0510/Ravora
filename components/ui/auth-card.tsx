import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  LoaderCircle,
  TrendingUp,
  BrainCircuit,
  LockKeyhole,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import AuthSwitch from './auth-switch';
import Demo from './demo';

// Validation Schemas
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(true),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), { message: 'Must contain an uppercase letter' })
    .refine((val) => /[a-z]/.test(val), { message: 'Must contain a lowercase letter' })
    .refine((val) => /[0-9]/.test(val), { message: 'Must contain a number' }),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms and conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

const resetSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .refine((val) => /[A-Z]/.test(val), { message: 'Must contain an uppercase letter' })
    .refine((val) => /[a-z]/.test(val), { message: 'Must contain a lowercase letter' })
    .refine((val) => /[0-9]/.test(val), { message: 'Must contain a number' }),
  confirmPassword: z.string().min(1, 'Password confirmation is required'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SignupFormValues = z.infer<typeof signupSchema>;
type ForgotFormValues = z.infer<typeof forgotSchema>;
type ResetFormValues = z.infer<typeof resetSchema>;

const getErrorMessage = (err: any): string => {
  if (!err) return '';
  if (typeof err === 'string') return err;
  if (err.message && typeof err.message === 'string') return err.message;
  try {
    return JSON.stringify(err);
  } catch (e) {
    return String(err);
  }
};

export const AuthCardPage: React.FC = () => {
  const { login, register, forgotPassword, resetPassword, signInWithOAuth, verifyOtpCode, supabaseClient } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetMode = searchParams.get('mode') === 'reset';
  const paramMode = searchParams.get('mode');
  const initialMode = paramMode === 'register' ? 'register' : (paramMode === 'login' ? 'login' : (resetMode ? 'reset' : 'login'));

  // UI States
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset' | 'otp'>(
    initialMode
  );

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'register' || m === 'login' || m === 'reset') {
      setMode(m as any);
    }
  }, [searchParams]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // OTP Verification States
  const [otpTarget, setOtpTarget] = useState('');
  const [otpUserId, setOtpUserId] = useState('');
  const [otpCodeValue, setOtpCodeValue] = useState('');
  const [sandboxOtp, setSandboxOtp] = useState<string | null>(null);

  // Forms
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const signupForm = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', acceptTerms: undefined },
  });

  const forgotForm = useForm<ForgotFormValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const resetForm = useForm<ResetFormValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  // Watch password field to display dynamic strength indicator
  const signupPassword = signupForm.watch('password');
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-transparent' });

  useEffect(() => {
    if (!signupPassword) {
      setPasswordStrength({ score: 0, label: '', color: 'bg-transparent' });
      return;
    }
    let score = 0;
    if (signupPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(signupPassword)) score += 1;
    if (/[a-z]/.test(signupPassword)) score += 1;
    if (/[0-9]/.test(signupPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(signupPassword)) score += 1;

    let label = 'Weak';
    let color = 'bg-rose-500';
    if (score >= 4) {
      label = 'Strong';
      color = 'bg-emerald-500';
    } else if (score >= 3) {
      label = 'Medium';
      color = 'bg-amber-500';
    }

    setPasswordStrength({ score, label, color });
  }, [signupPassword]);

  // Handle forms submissions
  const onLoginSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await login(values.email, false, false, values.password, values.rememberMe);
      if (res.success) {
        if (res.otpRequired) {
          setOtpTarget(values.email);
          setOtpUserId(res.userId || '');
          setSandboxOtp(res.otpCode || null);
          toast.success('Security Verification Required', { description: 'Please enter the 6-digit access code sent to your email.' });
          if (res.otpCode) {
            toast.info(`Sandbox Developer Mode: Auto-generated OTP code is ${res.otpCode}`, { duration: 15000 });
          }
          setMode('otp');
        } else {
          toast.success('Login Successful', { description: 'Welcome back to Ravora OS!' });
          navigate('/dashboard');
        }
      } else {
        setServerError(getErrorMessage(res.error) || 'Failed to sign in.');
      }
    } catch (err: any) {
      setServerError(getErrorMessage(err) || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSignupSubmit = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await register(values.fullName, values.email, false, values.password, values.confirmPassword);
      if (res.success) {
        if (res.otpRequired) {
          setOtpTarget(values.email);
          setOtpUserId(res.userId || '');
          setSandboxOtp(res.otpCode || null);
          toast.success('Account Created', { description: 'Please enter the 6-digit access code sent to your email.' });
          if (res.otpCode) {
            toast.info(`Sandbox Developer Mode: Auto-generated OTP code is ${res.otpCode}`, { duration: 15000 });
          }
          setMode('otp');
        } else {
          toast.success('Account Created', { description: 'Welcome to Ravora OS!' });
          navigate('/dashboard');
        }
      } else {
        setServerError(getErrorMessage(res.error) || 'Failed to register.');
      }
    } catch (err: any) {
      setServerError(getErrorMessage(err) || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCodeValue || otpCodeValue.length < 6) {
      setServerError('Please enter a 6-digit OTP code.');
      return;
    }
    setIsSubmitting(true);
    setServerError(null);
    try {
      const rememberMe = loginForm.getValues('rememberMe') ?? true;
      const res = await verifyOtpCode(otpTarget, false, otpCodeValue, otpUserId, rememberMe);
      if (res.success) {
        toast.success('Verification Successful', { description: 'Welcome to Ravora OS!' });
        navigate('/dashboard');
      } else {
        setServerError(getErrorMessage(res.error) || 'Failed to verify OTP.');
      }
    } catch (err: any) {
      setServerError(getErrorMessage(err) || 'Verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github' | 'twitter') => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await signInWithOAuth(provider);
      if (res.success) {
        toast.success('Social Login Successful', { description: 'Welcome to Ravora OS!' });
        navigate('/dashboard');
      } else {
        setServerError(getErrorMessage(res.error) || `Failed to sign in with ${provider}.`);
      }
    } catch (err: any) {
      setServerError(getErrorMessage(err) || 'An unexpected error occurred during social login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgotSubmit = async (values: ForgotFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await forgotPassword(values.email);
      if (res.success) {
        if (res.error?.includes('[SANDBOX OTP]')) {
          const rawCode = res.error.replace('[SANDBOX OTP] ', '');
          setOtpTarget(values.email);
          setSandboxOtp(rawCode);
          toast.success('Recovery Request Successful', { description: 'Please enter the recovery OTP code.' });
          toast.info(`Sandbox Developer Mode: Auto-generated Recovery OTP is ${rawCode}`, { duration: 15000 });
          setMode('otp');
        } else {
          toast.success('Recovery Email Sent', { description: 'Verification email has been dispatched.' });
          setMode('login');
        }
      } else {
        setServerError(getErrorMessage(res.error) || 'Failed to send recovery email.');
      }
    } catch (err: any) {
      setServerError(getErrorMessage(err) || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResetSubmit = async (values: ResetFormValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const res = await resetPassword(values.password);
      if (res.success) {
        toast.success('Password Reset Email Sent', { description: 'Your password has been successfully updated.' });
        setMode('login');
      } else {
        setServerError(getErrorMessage(res.error) || 'Failed to reset password.');
      }
    } catch (err: any) {
      setServerError(getErrorMessage(err) || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Developer Quick Access Autofill
  const handleAutofillDemo = (email: string, pass: string) => {
    if (mode === 'login') {
      loginForm.setValue('email', email);
      loginForm.setValue('password', pass);
      toast.info('Demo Credentials Loaded');
    } else {
      setMode('login');
      setTimeout(() => {
        loginForm.setValue('email', email);
        loginForm.setValue('password', pass);
        toast.info('Demo Credentials Loaded');
      }, 100);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060B17] text-white flex flex-col lg:flex-row relative overflow-hidden font-body">
      
      {/* Background ambient lighting */}
      <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-[#4F7CFF]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-[#7A5AF8]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* LEFT STORY PANEL (Hidden on mobile/tablet) */}
      <div className="hidden lg:flex w-[48%] min-h-screen bg-gradient-to-br from-[#060B17] via-[#080E1E] to-[#0A142C] border-r border-white/5 flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_70%,transparent_100%)] pointer-events-none" />
        
        {/* Branding header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] flex items-center justify-center font-display font-bold text-lg shadow-[0_4px_20px_rgba(79,124,255,0.35)]">
            R
          </div>
          <span className="font-display font-bold text-xl tracking-wide bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
            Ravora OS
          </span>
        </div>

        {/* Dynamic AI Showcase visual */}
        <div className="my-auto relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-accent-cyan mb-6 shadow-sm">
            <BrainCircuit className="w-3.5 h-3.5" />
            Araiven Intelligence Framework
          </div>
          
          <h2 className="text-4xl font-display font-bold leading-tight tracking-tight">
            Trade Smarter. <br />
            <span className="bg-gradient-to-r from-[#4F7CFF] via-[#7A5AF8] to-[#06B6D4] bg-clip-text text-transparent">
              Let AI Do The Rest.
            </span>
          </h2>
          
          <p className="text-slate-400 mt-4 leading-relaxed text-sm">
            Ravora continuously scans global orderbooks, builds risk-audited execution target levels, and monitors drawdown limits autonomously to grow your capital without emotion.
          </p>

          {/* Simple floating trading dashboard mockup */}
          <div className="mt-8 p-5 bg-[#0F172A]/60 border border-white/5 rounded-2xl backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Araiven Stance: Active Yield Staking</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Confidence: 94%</span>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Virtual Balance</span>
                <h4 className="text-xl font-bold tracking-tight text-white mt-0.5">$132,194.10</h4>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">24h Alpha Return</span>
                <h4 className="text-xs font-bold text-emerald-400 mt-0.5 font-mono">+12.0% (+$14,210)</h4>
              </div>
            </div>

            {/* Simple SVG Chart Line */}
            <div className="mt-4 h-16 w-full flex items-end">
              <svg className="w-full h-full text-[#4F7CFF]" viewBox="0 0 100 30" preserveAspectRatio="none">
                <path
                  d="M0,25 Q15,15 30,20 T60,5 T90,8 T100,2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-xs text-slate-500 font-medium relative z-10 flex justify-between">
          <span>Security Guard Core Active</span>
          <span>© 2026 Ravora</span>
        </div>
      </div>

      {/* RIGHT AUTHENTICATION CARD PANEL */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12 min-h-screen relative z-10">
        
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8.5 h-8.5 rounded-lg bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] flex items-center justify-center font-display font-bold text-base shadow-[0_4px_16px_rgba(79,124,255,0.25)]">
            R
          </div>
          <span className="font-display font-bold text-lg tracking-wide">Ravora OS</span>
        </div>

        {/* Main Glassmorphic Wrapper */}
        <div className="max-w-[480px] w-full bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300">
          
          {/* Mode Switch Tab Bar */}
          {mode !== 'forgot' && mode !== 'reset' && mode !== 'otp' && (
            <div className="mb-8">
              <AuthSwitch mode={mode} onChange={(newMode) => { setMode(newMode as any); setServerError(null); }} />
            </div>
          )}

          {/* Heading */}
          <div className="mb-6 text-center">
            {mode === 'login' && (
              <>
                <h3 className="text-2xl font-bold tracking-tight">Welcome Back</h3>
                <p className="text-slate-400 text-xs mt-1.5">Configure your terminal to access the advisory node.</p>
              </>
            )}
            {mode === 'register' && (
              <>
                <h3 className="text-2xl font-bold tracking-tight">Create Workspace</h3>
                <p className="text-slate-400 text-xs mt-1.5">Sign up to claim your $100,000 virtual asset portfolio.</p>
              </>
            )}
            {mode === 'forgot' && (
              <>
                <h3 className="text-2xl font-bold tracking-tight">Recovery Dispatch</h3>
                <p className="text-slate-400 text-xs mt-1.5">Enter your email address to receive password keys.</p>
              </>
            )}
            {mode === 'reset' && (
              <>
                <h3 className="text-2xl font-bold tracking-tight">Initialize Credentials</h3>
                <p className="text-slate-400 text-xs mt-1.5">Enter a strong, secure password for your workspace.</p>
              </>
            )}
            {mode === 'otp' && (
              <>
                <h3 className="text-2xl font-bold tracking-tight">Shield Verification</h3>
                <p className="text-slate-400 text-xs mt-1.5">Please enter the 6-digit access code sent to your email.</p>
              </>
            )}
          </div>

          {/* Server/Supabase Error Alert */}
          {serverError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-start gap-2.5 animate-fadeIn">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
              <p className="leading-relaxed">{serverError}</p>
            </div>
          )}

          {/* FORM LAYOUTS */}

          {/* 1. SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    autoComplete="username"
                    {...loginForm.register('email')}
                    className="w-full h-12 pl-11 pr-4 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{loginForm.formState.errors.email.message}</span>
                )}
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[10px] font-semibold text-[#4F7CFF] hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...loginForm.register('password')}
                    className="w-full h-12 pl-11 pr-11 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{loginForm.formState.errors.password.message}</span>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  {...loginForm.register('rememberMe')}
                  className="rounded border-white/10 text-[#4F7CFF] bg-[#0E1325] focus:ring-offset-0 focus:ring-[#4F7CFF] w-4 h-4"
                />
                <label htmlFor="rememberMe" className="ml-2.5 text-xs text-slate-400 font-semibold select-none cursor-pointer">
                  Remember terminal session
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] hover:opacity-95 transition-all text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(79,124,255,0.2)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  'Launch Adviser'
                )}
              </button>
            </form>
          )}

          {/* 2. SIGN UP FORM */}
          {mode === 'register' && (
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    autoComplete="name"
                    {...signupForm.register('fullName')}
                    className="w-full h-11 pl-11 pr-4 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                </div>
                {signupForm.formState.errors.fullName && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{signupForm.formState.errors.fullName.message}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    autoComplete="email"
                    {...signupForm.register('email')}
                    className="w-full h-11 pl-11 pr-4 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                </div>
                {signupForm.formState.errors.email && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{signupForm.formState.errors.email.message}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...signupForm.register('password')}
                    className="w-full h-11 pl-11 pr-11 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupForm.formState.errors.password && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{signupForm.formState.errors.password.message}</span>
                )}

                {/* Password Strength Indicator Visual */}
                {signupPassword && (
                  <div className="mt-2.5">
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-full flex-1 transition-colors duration-300 ${
                            passwordStrength.score >= level ? passwordStrength.color : 'bg-white/5'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between mt-1 text-[9px] font-semibold tracking-wide uppercase text-slate-500">
                      <span>Password Strength</span>
                      <span className={passwordStrength.score >= 4 ? 'text-emerald-400' : passwordStrength.score >= 3 ? 'text-amber-400' : 'text-rose-400'}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...signupForm.register('confirmPassword')}
                    className="w-full h-11 pl-11 pr-11 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupForm.formState.errors.confirmPassword && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{signupForm.formState.errors.confirmPassword.message}</span>
                )}
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  {...signupForm.register('acceptTerms')}
                  className="rounded border-white/10 text-[#4F7CFF] bg-[#0E1325] focus:ring-offset-0 focus:ring-[#4F7CFF] w-4 h-4 mt-0.5"
                />
                <label htmlFor="acceptTerms" className="ml-2.5 text-[11px] text-slate-400 leading-normal select-none cursor-pointer">
                  I accept the Ravora{' '}
                  <a href="#" className="text-[#4F7CFF] hover:underline">Terms of Service</a> and{' '}
                  <a href="#" className="text-[#4F7CFF] hover:underline">Privacy Policy</a>
                </label>
              </div>
              {signupForm.formState.errors.acceptTerms && (
                <span className="text-[10px] text-rose-400 mt-0.5 block">{signupForm.formState.errors.acceptTerms.message}</span>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] hover:opacity-95 transition-all text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(79,124,255,0.2)] disabled:opacity-50 mt-2"
              >
                {isSubmitting ? (
                  <LoaderCircle className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  'Create Account'
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@domain.com"
                    autoComplete="email"
                    {...forgotForm.register('email')}
                    className="w-full h-12 pl-11 pr-4 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                </div>
                {forgotForm.formState.errors.email && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{forgotForm.formState.errors.email.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] hover:opacity-95 transition-all text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(79,124,255,0.2)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setServerError(null); }}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-white transition-colors duration-200 mt-2 block"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* 4. RESET PASSWORD FORM */}
          {mode === 'reset' && (
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...resetForm.register('password')}
                    className="w-full h-12 pl-11 pr-11 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.password && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{resetForm.formState.errors.password.message}</span>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Confirm New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    {...resetForm.register('confirmPassword')}
                    className="w-full h-12 pl-11 pr-11 bg-white/[0.02] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetForm.formState.errors.confirmPassword && (
                  <span className="text-[10px] text-rose-400 mt-1 block">{resetForm.formState.errors.confirmPassword.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] hover:opacity-95 transition-all text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(79,124,255,0.2)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  'Update Password'
                )}
              </button>
            </form>
          )}

          {/* 5. OTP VERIFICATION FORM */}
          {mode === 'otp' && (
            <form onSubmit={onOtpSubmit} className="space-y-5 animate-fadeIn">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">8-Digit Verification Code</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength={8}
                    placeholder="••••••••"
                    value={otpCodeValue}
                    onChange={(e) => setOtpCodeValue(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-12 pl-11 pr-4 bg-[#0A0F1D] border border-white/10 rounded-xl focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] outline-none text-sm transition-all placeholder-slate-600 text-center font-mono text-lg tracking-[0.3em]"
                  />
                </div>
                {sandboxOtp && (
                  <button
                    type="button"
                    onClick={() => setOtpCodeValue(sandboxOtp)}
                    className="text-[10px] font-semibold text-emerald-400 mt-2.5 hover:underline block text-left"
                  >
                    Sandbox Mode: Autofill Code ({sandboxOtp})
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting || otpCodeValue.length !== 8}
                className="w-full h-12 bg-gradient-to-r from-[#4F7CFF] to-[#7A5AF8] hover:opacity-95 transition-all text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(79,124,255,0.2)] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoaderCircle className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  'Verify Code'
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setServerError(null); setOtpCodeValue(''); }}
                className="w-full text-center text-xs font-bold text-slate-400 hover:text-white transition-colors duration-200 mt-2 block"
              >
                Back to Sign In
              </button>
            </form>
          )}

          {/* Social Sign In (Only for login and register modes) */}
          {(mode === 'login' || mode === 'register') && (
            <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-white/5"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or continue with</span>
                <div className="flex-grow border-t border-white/5"></div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isSubmitting}
                  className="flex h-11 items-center justify-center bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-[#4F7CFF]/50 transition-all rounded-xl disabled:opacity-50"
                  title="Sign in with Google"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.53 5.53 0 0 1 8.4 12.99a5.53 5.53 0 0 1 5.59-5.527c1.478 0 2.828.534 3.882 1.54l3.13-3.13C19.062 3.997 16.716 3 13.99 3c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.523 0 10-4.477 10-10a9.06 9.06 0 0 0-.15-1.715H12.24Z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('github')}
                  disabled={isSubmitting}
                  className="flex h-11 items-center justify-center bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-[#4F7CFF]/50 transition-all rounded-xl disabled:opacity-50"
                  title="Sign in with GitHub"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialLogin('twitter')}
                  disabled={isSubmitting}
                  className="flex h-11 items-center justify-center bg-white/[0.02] border border-white/10 hover:bg-white/[0.06] hover:border-[#4F7CFF]/50 transition-all rounded-xl disabled:opacity-50"
                  title="Sign in with X"
                >
                  <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Developer Quick-Access Autofill (Visible only in dev/test/sandbox mode) */}
        <Demo onSelectDemoUser={handleAutofillDemo} isLoading={isSubmitting} />

      </div>
    </div>
  );
};

export default AuthCardPage;
