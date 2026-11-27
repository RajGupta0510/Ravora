p='src/App.tsx'
s=open(p,encoding='utf8').read()
def rep(a,b):
    global s
    assert a in s,a[:40]
    s=s.replace(a,b,1)
rep("import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';",
    "import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useParams } from 'react-router-dom';")
rep("import { ConsentBanner } from './consent/ConsentBanner';\n",
"""import { ConsentBanner } from './consent/ConsentBanner';
import { usePageMeta } from './utils/seo';
""")
rep("const AuthCardPage =","""const NotFound = React.lazy(() => import('./components/NotFound'));
const AuthCardPage =""")
rep("// Lightweight loading skeleton","""// Per-route title and description. Renders nothing.
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

// Lightweight loading skeleton""")
rep("""<Route path="/" element={<LandingPage />} />""","""<Route path="/" element={<><Seo title="Ravora | AI crypto trade plans with the reasoning attached" description="Ravora scans crypto markets around the clock, scores every setup and hands you a full trade plan with the reasoning attached. Start with $100k of paper money. No card needed." /><LandingPage /></>} />""")
rep("""            <GuestRoute>
              <AuthCardPage />""","""            <GuestRoute>
              <AuthSeo />
              <AuthCardPage />""")
rep("""            <OnboardingRoute>
              <OnboardingWizard />""","""            <OnboardingRoute>
              <Seo title="Set up your workspace | Ravora" description="Tell Ravora about your experience and risk comfort to tailor your workspace." noindex />
              <OnboardingWizard />""")
rep("""  <ProtectedRoute>
    <AppDashboard />""","""  <ProtectedRoute>
    <Seo title="Dashboard | Ravora" description="Your Ravora trading workspace." noindex />
    <AppDashboard />""")
rep("""<Route path="*" element={<Navigate to="/" replace />} />""","""<Route path="*" element={<NotFound />} />""")
open(p,'w',encoding='utf8').write(s)
