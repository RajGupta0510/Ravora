import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import LandingPage from './components/landing/LandingPage';
import OnboardingWizard from './components/dashboard/OnboardingWizard';
import AppDashboard from './components/dashboard/AppDashboard';

const AppContent: React.FC = () => {
  const { token, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100vw',
        height: '100vh',
        background: '#060913',
        color: '#fff',
        fontFamily: 'sans-serif'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          border: '3px solid rgba(255,255,255,0.1)',
          borderRadius: '50%',
          borderTopColor: '#7c3aed',
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

  // Session exists and onboarding is complete: Load active dashboard
  if (token && user?.onboardingCompleted) {
    return <AppDashboard />;
  }

  // Session exists but onboarding is not complete: Load onboarding flow
  if (token && !user?.onboardingCompleted) {
    return <OnboardingWizard />;
  }

  // No active session: Serve public landing page
  return <LandingPage />;
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
