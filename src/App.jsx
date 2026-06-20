import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ParliamentaryDebate from './pages/ParliamentaryDebate';
import PublicForum from './pages/PublicForum';
import ModelUN from './pages/ModelUN';
import ModelCongress from './pages/ModelCongress';
import TournamentPage from './pages/TournamentPage';
import ProfilePage from './pages/ProfilePage';
import DebateWiki from './pages/DebateWiki';
import EvidenceLocker from './pages/EvidenceLocker';
import CaseVault from './pages/CaseVault';
import FlowingTool from './pages/FlowingTool';
import PracticeRound from './pages/PracticeRound';
import AICoach from './pages/AICoach';
import DebateFormats from './pages/DebateFormats';
import LandingPreview from './pages/LandingPreview';
import OfficeHours from './pages/OfficeHours';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import TermsAndPrivacy from './pages/TermsAndPrivacy';
import BanGate from './components/BanGate';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin, isAuthenticated } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
    return (
      <Routes>
        <Route path="/" element={<LandingPreview />} />
        <Route path="/terms" element={<TermsAndPrivacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<LandingPreview />} />
      </Routes>
    );
    }
  }

  // Not authenticated → show auth pages, redirect everything else to login
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<LandingPreview />} />
        <Route path="/terms" element={<TermsAndPrivacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<LandingPreview />} />
      </Routes>
    );
  }

  // Authenticated → full app
  return (
    <BanGate>
      <Routes>
        <Route path="/" element={<LandingPreview />} />
        <Route path="/terms" element={<TermsAndPrivacy />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route element={<Layout />}>
          <Route path="/home" element={<Dashboard />} />
          <Route path="/parliamentary" element={<ParliamentaryDebate />} />
          <Route path="/public-forum" element={<PublicForum />} />
          <Route path="/model-un" element={<ModelUN />} />
          <Route path="/model-congress" element={<ModelCongress />} />
          <Route path="/tournament" element={<TournamentPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/wiki" element={<DebateWiki />} />
          <Route path="/evidence-locker" element={<EvidenceLocker />} />
          <Route path="/case-vault" element={<CaseVault />} />
          <Route path="/flowing-tool" element={<FlowingTool />} />
          <Route path="/practice" element={<PracticeRound />} />
          <Route path="/ai-coach" element={<AICoach />} />
          <Route path="/office-hours" element={<OfficeHours />} />
          <Route path="/formats" element={<DebateFormats />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
        </Route>
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BanGate>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App