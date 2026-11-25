import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useAuth } from '../../src/context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, CircleAlert, Eye, EyeOff, LoaderCircle } from 'lucide-react';
import AuthSwitch from './auth-switch';
import './auth-card.css';

// Validation Schemas
const emailOrPhoneSchema = z.string().min(1, 'Email or phone number is required').refine(
  (val) => {
    const isEmail = z.string().email().safeParse(val).success;
    const isPhone = /^\+?[0-9\s\-()]{7,15}$/.test(val.trim());
    return isEmail || isPhone;
  },
  { message: 'Invalid email address or phone number (e.g. +1234567890)' }
);

const loginSchema = z.object({
  email: emailOrPhoneSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(true),
});

const signupSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailOrPhoneSchema,
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
  email: emailOrPhoneSchema,
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
  const { login, register, forgotPassword, resetPassword, signInWithOAuth, verifyOtpCode } = useAuth();
  const navigate = useNavigate();
  const { mode: pathMode } = useParams<{ mode: string }>();
  const mode = (pathMode as 'login' | 'register' | 'forgot' | 'reset' | 'otp') || 'login';

  console.log('[DEBUG] AuthCardPage render. Current mode state:', mode);

  const changeMode = (newMode: 'login' | 'register' | 'forgot' | 'reset' | 'otp') => {
    console.log('[DEBUG] changeMode called with target:', newMode);
    setServerError(null);
    navigate(`/auth/${newMode}`);
  };


  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // OTP Verification States
  const [otpTarget, setOtpTarget] = useState('');
  const [isOtpPhone, setIsOtpPhone] = useState(false);
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
      const isPhone = /^\+?[0-9\s\-()]{7,15}$/.test(values.email.trim());
      const res = await login(values.email, isPhone, false, values.password, values.rememberMe);
      if (res.success) {
        if (res.otpRequired) {
          setOtpTarget(values.email);
          setIsOtpPhone(isPhone);
          setOtpUserId(res.userId || '');
          setSandboxOtp(res.otpCode || null);
          toast.success('Security Verification Required', { description: `Please enter the 6-digit access code sent to your ${isPhone ? 'phone' : 'email'}.` });
          if (res.otpCode) {
            toast.info(`Sandbox Developer Mode: Auto-generated OTP code is ${res.otpCode}`, { duration: 15000 });
          }
          changeMode('otp');
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
      const isPhone = /^\+?[0-9\s\-()]{7,15}$/.test(values.email.trim());
      const res = await register(values.fullName, values.email, isPhone, values.password, values.confirmPassword);
      if (res.success) {
        if (res.otpRequired) {
          setOtpTarget(values.email);
          setIsOtpPhone(isPhone);
          setOtpUserId(res.userId || '');
          setSandboxOtp(res.otpCode || null);
          toast.success('Account Created', { description: `Please enter the 6-digit access code sent to your ${isPhone ? 'phone' : 'email'}.` });
          if (res.otpCode) {
            toast.info(`Sandbox Developer Mode: Auto-generated OTP code is ${res.otpCode}`, { duration: 15000 });
          }
          changeMode('otp');
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
      const res = await verifyOtpCode(otpTarget, isOtpPhone, otpCodeValue, otpUserId, rememberMe);
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
      const isPhone = /^\+?[0-9\s\-()]{7,15}$/.test(values.email.trim());
      if (isPhone) {
        setServerError('Password recovery is only supported for email addresses. For phone numbers, please sign in using OTP.');
        setIsSubmitting(false);
        return;
      }
      const res = await forgotPassword(values.email);
      if (res.success) {
        if (res.error?.includes('[SANDBOX OTP]')) {
          const rawCode = res.error.replace('[SANDBOX OTP] ', '');
          setOtpTarget(values.email);
          setSandboxOtp(rawCode);
          toast.success('Recovery Request Successful', { description: 'Please enter the recovery OTP code.' });
          toast.info(`Sandbox Developer Mode: Auto-generated Recovery OTP is ${rawCode}`, { duration: 15000 });
          changeMode('otp');
        } else {
          toast.success('Recovery Email Sent', { description: 'Verification email has been dispatched.' });
          changeMode('login');
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
        changeMode('login');
      } else {
        setServerError(getErrorMessage(res.error) || 'Failed to reset password.');
      }
    } catch (err: any) {
      setServerError(getErrorMessage(err) || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };


  const reduced = useReducedMotion();
  // Autofocus on large screens only: on phones it pops the keyboard and scrolls the mode switch out of view.
  const canAutoFocus = typeof window !== 'undefined' && window.matchMedia('(min-width: 1001px)').matches;
  const ease = [0.16, 1, 0.3, 1] as const;
  const isCredentialMode = mode === 'login' || mode === 'register';

  const copy = {
    login: { title: 'Welcome back', sub: 'Sign in to your Araiven workspace.' },
    register: { title: 'Create your account', sub: 'Start with a $100,000 paper portfolio. No card needed.' },
    forgot: { title: 'Reset your password', sub: "Enter your email and we'll send you a reset link." },
    reset: { title: 'Choose a new password', sub: 'Use a strong password you have not used elsewhere.' },
    otp: { title: 'Check your code', sub: `Enter the access code we sent to your ${isOtpPhone ? 'phone' : 'email'}.` },
  }[mode];

  const strengthWord = passwordStrength.score >= 4 ? 'Strong' : passwordStrength.score >= 3 ? 'Medium' : 'Weak';
  const strengthLevel = passwordStrength.score >= 4 ? 3 : passwordStrength.score >= 3 ? 2 : 1;
  const strengthBars = Math.min(4, Math.max(passwordStrength.score ? 1 : 0, Math.ceil((passwordStrength.score / 5) * 4)));

  const busyLabel = (idle: string, busy: string) =>
    isSubmitting ? (
      <>
        <LoaderCircle size={18} className="ra-spin" aria-hidden="true" />
        {busy}
      </>
    ) : (
      idle
    );

  return (
    <div className="ra">
      {/* Story panel (desktop) */}
      <aside className="ra-story" aria-hidden="true">
        <a className="ra-logo" href="/" tabIndex={-1}>
          <span className="ra-logo-mark">R</span>
          Ravora
        </a>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode === 'register' ? 'register' : 'login'}
            className="ra-story-body"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: reduced ? 0 : 0.35, ease }}
          >
            <h2 className="ra-story-h">
              {mode === 'register' ? 'Open your account in a minute.' : 'Pick up where Araiven left off.'}
            </h2>
            <p className="ra-story-p">
              {mode === 'register'
                ? 'Start with a $100,000 paper portfolio. No card, no exchange connection.'
                : 'Your watchlist, paper account and trade plans are waiting.'}
            </p>
            <ol className="ra-tape">
              {TAPE.map((row, i) => (
                <li key={row.l} className={i === TAPE.length - 1 ? 'is-final' : ''} style={{ ['--i' as string]: i }}>
                  <span className="t">{row.t}</span>
                  <span className="l">{row.l}</span>
                  <span className="v">{row.v}</span>
                </li>
              ))}
            </ol>
          </motion.div>
        </AnimatePresence>

        <p className="ra-story-foot">Illustrative sequence. © 2026 Ravora</p>
      </aside>

      {/* Form column */}
      <main className="ra-main">
        <div className="ra-col">
          <a className="ra-logo ra-logo-m" href="/">
            <span className="ra-logo-mark">R</span>
            Ravora
          </a>

          {isCredentialMode && <AuthSwitch mode={mode as 'login' | 'register'} onChange={(m) => changeMode(m)} />}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduced ? 0 : 0.3, ease }}
            >
              <h1 className="ra-title">{copy.title}</h1>
              <p className="ra-sub">{copy.sub}</p>

              {serverError && (
                <div className="ra-alert" role="alert">
                  <CircleAlert size={16} aria-hidden="true" />
                  <p>{serverError}</p>
                </div>
              )}

              {/* 1. SIGN IN */}
              {mode === 'login' && (
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="ra-form" noValidate>
                  <Field id="login-email" label="Email or phone" error={loginForm.formState.errors.email?.message}>
                    <input
                      id="login-email"
                      type="text"
                      placeholder="name@domain.com or +1234567890"
                      autoComplete="username"
                      autoFocus={canAutoFocus}
                      aria-invalid={!!loginForm.formState.errors.email}
                      aria-describedby="login-email-err"
                      className="ra-input"
                      {...loginForm.register('email')}
                    />
                  </Field>

                  <Field
                    id="login-password"
                    label="Password"
                    error={loginForm.formState.errors.password?.message}
                    aside={
                      <button type="button" className="ra-link" onClick={() => changeMode('forgot')}>
                        Forgot password?
                      </button>
                    }
                  >
                    <PasswordInput
                      id="login-password"
                      show={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                      invalid={!!loginForm.formState.errors.password}
                      autoComplete="current-password"
                      reg={loginForm.register('password')}
                    />
                  </Field>

                  <div className="ra-check">
                    <input type="checkbox" id="rememberMe" {...loginForm.register('rememberMe')} />
                    <label htmlFor="rememberMe">Keep me signed in</label>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="ra-btn">
                    {busyLabel('Sign in', 'Signing in…')}
                  </button>

                  <p className="ra-alt">
                    New to Ravora?{' '}
                    <button type="button" className="ra-link" onClick={() => changeMode('register')}>
                      Create an account
                    </button>
                  </p>
                </form>
              )}

              {/* 2. REGISTER */}
              {mode === 'register' && (
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="ra-form" noValidate>
                  <Field id="reg-name" label="Full name" error={signupForm.formState.errors.fullName?.message}>
                    <input
                      id="reg-name"
                      type="text"
                      placeholder="Your name"
                      autoComplete="name"
                      autoFocus={canAutoFocus}
                      aria-invalid={!!signupForm.formState.errors.fullName}
                      aria-describedby="reg-name-err"
                      className="ra-input"
                      {...signupForm.register('fullName')}
                    />
                  </Field>

                  <Field id="reg-email" label="Email or phone" error={signupForm.formState.errors.email?.message}>
                    <input
                      id="reg-email"
                      type="text"
                      placeholder="name@domain.com or +1234567890"
                      autoComplete="email"
                      aria-invalid={!!signupForm.formState.errors.email}
                      aria-describedby="reg-email-err"
                      className="ra-input"
                      {...signupForm.register('email')}
                    />
                  </Field>

                  <Field id="reg-password" label="Password" error={signupForm.formState.errors.password?.message}>
                    <PasswordInput
                      id="reg-password"
                      show={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                      invalid={!!signupForm.formState.errors.password}
                      autoComplete="new-password"
                      reg={signupForm.register('password')}
                    />
                    {signupPassword && (
                      <div aria-live="polite">
                        <div className="ra-meter" aria-hidden="true">
                          {[1, 2, 3, 4].map((n) => (
                            <i key={n} className={strengthBars >= n ? `on-${strengthLevel}` : ''} />
                          ))}
                        </div>
                        <div className="ra-meter-row" style={{ marginTop: 6 }}>
                          <span>Password strength</span>
                          <b>{strengthWord}</b>
                        </div>
                      </div>
                    )}
                  </Field>

                  <Field
                    id="reg-confirm"
                    label="Confirm password"
                    error={signupForm.formState.errors.confirmPassword?.message}
                  >
                    <PasswordInput
                      id="reg-confirm"
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      invalid={!!signupForm.formState.errors.confirmPassword}
                      autoComplete="new-password"
                      reg={signupForm.register('confirmPassword')}
                    />
                  </Field>

                  <div className="ra-field" style={{ gap: 8 }}>
                    <div className="ra-check">
                      <input type="checkbox" id="acceptTerms" {...signupForm.register('acceptTerms')} />
                      <label htmlFor="acceptTerms">
                        I accept the Ravora <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
                      </label>
                    </div>
                    <FieldError id="acceptTerms" message={signupForm.formState.errors.acceptTerms?.message} />
                  </div>

                  <button type="submit" disabled={isSubmitting} className="ra-btn">
                    {busyLabel('Create account', 'Creating account…')}
                  </button>

                  <p className="ra-alt">
                    Already have an account?{' '}
                    <button type="button" className="ra-link" onClick={() => changeMode('login')}>
                      Sign in
                    </button>
                  </p>
                </form>
              )}

              {/* 3. FORGOT */}
              {mode === 'forgot' && (
                <form onSubmit={forgotForm.handleSubmit(onForgotSubmit)} className="ra-form" noValidate>
                  <Field id="forgot-email" label="Email" error={forgotForm.formState.errors.email?.message}>
                    <input
                      id="forgot-email"
                      type="text"
                      placeholder="name@domain.com"
                      autoComplete="email"
                      autoFocus={canAutoFocus}
                      aria-invalid={!!forgotForm.formState.errors.email}
                      aria-describedby="forgot-email-err"
                      className="ra-input"
                      {...forgotForm.register('email')}
                    />
                  </Field>

                  <button type="submit" disabled={isSubmitting} className="ra-btn">
                    {busyLabel('Send reset link', 'Sending…')}
                  </button>

                  <button
                    type="button"
                    className="ra-back"
                    onClick={() => {
                      changeMode('login');
                      setServerError(null);
                    }}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Back to sign in
                  </button>
                </form>
              )}

              {/* 4. RESET */}
              {mode === 'reset' && (
                <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="ra-form" noValidate>
                  <Field id="reset-password" label="New password" error={resetForm.formState.errors.password?.message}>
                    <PasswordInput
                      id="reset-password"
                      show={showPassword}
                      onToggle={() => setShowPassword(!showPassword)}
                      invalid={!!resetForm.formState.errors.password}
                      autoComplete="new-password"
                      autoFocus={canAutoFocus}
                      reg={resetForm.register('password')}
                    />
                  </Field>

                  <Field
                    id="reset-confirm"
                    label="Confirm new password"
                    error={resetForm.formState.errors.confirmPassword?.message}
                  >
                    <PasswordInput
                      id="reset-confirm"
                      show={showConfirmPassword}
                      onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                      invalid={!!resetForm.formState.errors.confirmPassword}
                      autoComplete="new-password"
                      reg={resetForm.register('confirmPassword')}
                    />
                  </Field>

                  <button type="submit" disabled={isSubmitting} className="ra-btn">
                    {busyLabel('Update password', 'Updating…')}
                  </button>
                </form>
              )}

              {/* 5. OTP */}
              {mode === 'otp' && (
                <form onSubmit={onOtpSubmit} className="ra-form" noValidate>
                  <Field id="otp-code" label="Verification code">
                    <input
                      id="otp-code"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={8}
                      autoFocus={canAutoFocus}
                      placeholder="········"
                      value={otpCodeValue}
                      onChange={(e) => setOtpCodeValue(e.target.value.replace(/\D/g, ''))}
                      className="ra-input ra-code"
                    />
                    {sandboxOtp && (
                      <button type="button" className="ra-hint" onClick={() => setOtpCodeValue(sandboxOtp)}>
                        Sandbox mode: autofill code ({sandboxOtp})
                      </button>
                    )}
                  </Field>

                  <button type="submit" disabled={isSubmitting || otpCodeValue.length !== 8} className="ra-btn">
                    {busyLabel('Verify code', 'Verifying…')}
                  </button>

                  <button
                    type="button"
                    className="ra-back"
                    onClick={() => {
                      changeMode('login');
                      setOtpCodeValue('');
                    }}
                  >
                    <ArrowLeft size={16} aria-hidden="true" />
                    Back to sign in
                  </button>
                </form>
              )}

              {/* Social sign-in */}
              {isCredentialMode && (
                <>
                  <div className="ra-or">or continue with</div>
                  <div className="ra-social">
                    <button type="button" onClick={() => handleSocialLogin('google')} disabled={isSubmitting} aria-label="Continue with Google">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.53 5.53 0 0 1 8.4 12.99a5.53 5.53 0 0 1 5.59-5.527c1.478 0 2.828.534 3.882 1.54l3.13-3.13C19.062 3.997 16.716 3 13.99 3c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.523 0 10-4.477 10-10a9.06 9.06 0 0 0-.15-1.715H12.24Z" />
                      </svg>
                      Google
                    </button>
                    <button type="button" onClick={() => handleSocialLogin('github')} disabled={isSubmitting} aria-label="Continue with GitHub">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                      </svg>
                      GitHub
                    </button>
                    <button type="button" onClick={() => handleSocialLogin('twitter')} disabled={isSubmitting} aria-label="Continue with X">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Presentation helpers                                                */
/* ------------------------------------------------------------------ */

const TAPE = [
  { t: 'T+0.0s', l: 'Scan', v: '7 markets' },
  { t: 'T+0.6s', l: 'Structure', v: 'BTC support held' },
  { t: 'T+1.2s', l: 'Score', v: '82 confidence' },
  { t: 'T+1.8s', l: 'Risk gate', v: 'within 3.5% cap' },
  { t: 'T+2.4s', l: 'Plan', v: 'entry 64,120 · stop 61,870' },
];

const FieldError: React.FC<{ id: string; message?: string }> = ({ id, message }) => (
  <AnimatePresence initial={false}>
    {message && (
      <motion.p
        id={`${id}-err`}
        role="alert"
        className="ra-err"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <CircleAlert size={15} aria-hidden="true" />
        <span>{message}</span>
      </motion.p>
    )}
  </AnimatePresence>
);

const Field: React.FC<{
  id: string;
  label: string;
  error?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, label, error, aside, children }) => (
  <div className="ra-field">
    <div className="ra-label-row">
      <label htmlFor={id}>{label}</label>
      {aside}
    </div>
    {children}
    <FieldError id={id} message={error} />
  </div>
);

const PasswordInput: React.FC<{
  id: string;
  show: boolean;
  onToggle: () => void;
  invalid: boolean;
  autoComplete: string;
  autoFocus?: boolean;
  reg: React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement> };
}> = ({ id, show, onToggle, invalid, autoComplete, autoFocus, reg }) => (
  <div className="ra-input-wrap">
    <input
      id={id}
      type={show ? 'text' : 'password'}
      placeholder="At least 8 characters"
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      aria-invalid={invalid}
      aria-describedby={`${id}-err`}
      className="ra-input has-eye"
      {...reg}
    />
    <button
      type="button"
      className="ra-eye"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      aria-pressed={show}
    >
      {show ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
    </button>
  </div>
);

export default AuthCardPage;
