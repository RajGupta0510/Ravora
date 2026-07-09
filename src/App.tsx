import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';
import LandingPage from './components/landing/LandingPage';
import { OnboardingWizard } from './components/dashboard/OnboardingWizard';
import { AppDashboard } from './components/dashboard/AppDashboard';
import { AuthCardPage } from 'components/ui/auth-card';

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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        <Route path="/auth" element={
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
            <AppDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
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
