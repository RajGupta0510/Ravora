import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AppDashboard } from './components/dashboard/AppDashboard';
import { Toaster } from 'sonner';
import { ConsentProvider } from './consent/ConsentContext';
import { ConsentBanner } from './consent/ConsentBanner';
import { usePageMeta } from './utils/seo';


const Agentation = import.meta.env.DEV
  ? lazy(() => import('agentation').then(module => ({ default: module.Agentation })))
  : null;

// Lazy-loaded page components — only downloaded when their route is visited
const LandingPage = React.lazy(() => import('./components/landing/LandingPage'));
const LegalPage = React.lazy(() => import('./legal/LegalPage'));
const OnboardingWizard = React.lazy(() => import('./components/dashboard/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const NotFound = React.lazy(() => import('./components/NotFound'));
const AuthCardPage = React.lazy(() => import('components/ui/auth-card').then(m => ({ default: m.AuthCardPage })));

// Per-route title and description. Renders nothing.
const Seo: React.FC<{ title: string; description: string; noindex?: boolean }> = (props) => {
  usePageMeta(props);
  return null;
};

const AUTH_META: Record<string, { title: string; description: string; noindex?: boolean }> = {
  login: { title: 'Sign in | Ravora', description: 'Sign in to Ravora to review AI trade plans, manage your paper portfolio and chat with Araiven.' },
  register: { title: 'Create your account | Ravora', description: 'Create a free Ravora account and start with $100k of paper money. No card and no exchange connection needed.' },
  forgot: { title: 'Reset your password | Ravora', description: 'Request a link or code to reset your Ravora password.', noindex: true },
  reset: { title: 'Choose a new password | Ravora', description: 'Choose a new password for your Ravora account.', noindex: true },
  otp: { title: 'Verify your code | Ravora', description: 'Enter the verification code we sent you to continue to Ravora.', noindex: true },
};

const AuthSeo: React.FC = () => {
  const { mode } = useParams<{ mode: string }>();
  const meta = AUTH_META[mode ?? ''] ?? AUTH_META.login;
  return <Seo {...meta} />;
};

// Lightweight loading skeleton shown while lazy chunks download
const PageSkeleton: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    background: '#0B0E14',
    color: '#F8FAFC',
    fontFamily: 'var(--font-body)'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid rgba(203,213,225,0.12)',
      borderRadius: '50%',
      borderTopColor: '#F59E0B',
      animation: 'spin-loader 0.8s linear infinite',
      marginBottom: '16px'
    }}></div>
    <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#CBD5E1', fontWeight: 600 }}>
      LOADING...
    </div>
    <style>{`
      @keyframes spin-loader {
        to { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Protected Route Wrapper - redirects unauthenticated users to login, and forces onboarding if not completed
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) return null;

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (!user?.onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

// Onboarding Route Wrapper - redirects unauthenticated users to login, and redirects to dashboard if already onboarded
const OnboardingRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) return null;

  if (!token) {
    return <Navigate to="/auth" replace />;
  }

  if (user?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Route wrapper for guest pages (login/signup) - redirects authenticated users to dashboard or onboarding
const GuestRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, user, loading } = useAuth();

  if (loading) return null;

  if (token) {
    if (user?.onboardingCompleted) {
      return <Navigate to="/dashboard" replace />;
    } else {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        background: '#0B0E14',
        color: '#F8FAFC',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(203,213,225,0.12)',
          borderRadius: '50%',
          borderTopColor: '#F59E0B',
          animation: 'spin-loader 0.8s linear infinite',
          marginBottom: '16px'
        }}></div>
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#CBD5E1', fontWeight: 600 }}>
          SYNCHRONIZING ARAIVEN...
        </div>
        <style>{`
          @keyframes spin-loader {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Redirect legacy query-parameter based auth to the clean path-based routing
 const AuthRedirect: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Supabase OAuth callback arrives with the session in the URL hash.
  // Do not redirect while Supabase is processing that callback.
  const hasOAuthCallback =
    window.location.hash.includes('access_token=') ||
    window.location.hash.includes('refresh_token=');

  if (hasOAuthCallback) {
    return null;
  }

  const mode = searchParams.get('mode');

  if (mode === 'register') return <Navigate to="/auth/register" replace />;
  if (mode === 'forgot') return <Navigate to="/auth/forgot" replace />;
  if (mode === 'reset') return <Navigate to="/auth/reset" replace />;
  if (mode === 'otp') return <Navigate to="/auth/otp" replace />;

  return <Navigate to="/auth/login" replace />;
};


  // Catch reloads on /app/* paths and redirect them to /app/index.html with initialRoute set
  const LegacyDashboardRedirect: React.FC = () => {
    React.useEffect(() => {
      const path = window.location.pathname.replace(/^\/app\/?/, '');
      if (path) {
        sessionStorage.setItem('initialRoute', path);
      }
      window.location.href = '/app/index.html';
    }, []);
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        background: '#0B0E14',
        color: '#F8FAFC',
        fontFamily: 'var(--font-body)'
      }}>
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#CBD5E1', fontWeight: 600 }}>
          RELOADING WORKSPACE...
        </div>
      </div>
    );
  };

  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<><Seo title="Ravora | AI crypto trade plans with the reasoning attached" description="Ravora scans crypto markets around the clock, scores every setup and hands you a full trade plan with the reasoning attached. Start with $100k of paper money. No card needed." /><LandingPage /></>} />

          <Route path="/legal/:doc" element={<LegalPage />} />

          <Route path="/auth" element={<AuthRedirect />} />
          <Route path="/auth/:mode" element={
            <GuestRoute>
              <AuthSeo />
              <AuthCardPage />
            </GuestRoute>
          } />

          <Route path="/onboarding" element={
            <OnboardingRoute>
              <Seo title="Set up your workspace | Ravora" description="Tell Ravora about your experience and risk comfort to tailor your workspace." noindex />
              <OnboardingWizard />
            </OnboardingRoute>
          } />

          <Route path="/dashboard" element={
  <ProtectedRoute>
    <Seo title="Dashboard | Ravora" description="Your Ravora trading workspace." noindex />
    <AppDashboard />
  </ProtectedRoute>
} />


          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <ConsentBanner />
      <Toaster theme="dark" position="top-right" richColors />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <ConsentProvider>
    <AuthProvider>
      <AppProvider>
        <AppContent />
        {Agentation && (
          <Suspense fallback={null}>
            <Agentation />
          </Suspense>
        )}
      </AppProvider>
    </AuthProvider>
    </ConsentProvider>
  );
};

export default App;
