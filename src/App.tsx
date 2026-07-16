import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';

// Lazy-loaded page components — only downloaded when their route is visited
const LandingPage = React.lazy(() => import('./components/landing/LandingPage'));
const OnboardingWizard = React.lazy(() => import('./components/dashboard/OnboardingWizard').then(m => ({ default: m.OnboardingWizard })));
const AuthCardPage = React.lazy(() => import('components/ui/auth-card').then(m => ({ default: m.AuthCardPage })));

// Lightweight loading skeleton shown while lazy chunks download
const PageSkeleton: React.FC = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100vw',
    height: '100vh',
    background: '#060B17',
    color: '#fff',
    fontFamily: 'sans-serif'
  }}>
    <div style={{
      width: '36px',
      height: '36px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderRadius: '50%',
      borderTopColor: '#4F7CFF',
      animation: 'spin-loader 0.8s linear infinite',
      marginBottom: '16px'
    }}></div>
    <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
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
        background: '#060B17',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          borderTopColor: '#4F7CFF',
          animation: 'spin-loader 0.8s linear infinite',
          marginBottom: '16px'
        }}></div>
        <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
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
  const mode = searchParams.get('mode');
  if (mode === 'register') return <Navigate to="/auth/register" replace />;
  if (mode === 'forgot') return <Navigate to="/auth/forgot" replace />;
  if (mode === 'reset') return <Navigate to="/auth/reset" replace />;
  if (mode === 'otp') return <Navigate to="/auth/otp" replace />;
  return <Navigate to="/auth/login" replace />;
};

// Redirect to legacy HTML/JS dashboard
const DashboardRedirect: React.FC = () => {
  React.useEffect(() => {
    window.location.href = '/app/';
  }, []);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      background: '#060B17',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
        LOADING WORKSPACE...
      </div>
    </div>
  );
};

// Catch reloads on /app/* paths and redirect them to /app/ with initialRoute set
const LegacyDashboardRedirect: React.FC = () => {
  React.useEffect(() => {
    const path = window.location.pathname.replace(/^\/app\/?/, '');
    if (path) {
      sessionStorage.setItem('initialRoute', path);
    }
    window.location.href = '/app/';
  }, []);
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100vw',
      height: '100vh',
      background: '#060B17',
      color: '#fff',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ fontSize: '0.78rem', letterSpacing: '0.08em', color: '#94a3b8', fontWeight: 600 }}>
        RELOADING WORKSPACE...
      </div>
    </div>
  );
};

  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/auth" element={<AuthRedirect />} />
          <Route path="/auth/:mode" element={
            <GuestRoute>
              <AuthCardPage />
            </GuestRoute>
          } />
          
          <Route path="/onboarding" element={
            <OnboardingRoute>
              <OnboardingWizard />
            </OnboardingRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardRedirect />
            </ProtectedRoute>
          } />
          
          <Route path="/app/*" element={<LegacyDashboardRedirect />} />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <Toaster theme="dark" position="top-right" richColors />
    </BrowserRouter>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
};

export default App;
