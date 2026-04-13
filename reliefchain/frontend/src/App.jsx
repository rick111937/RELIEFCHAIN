import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import ProjectDetails from './pages/ProjectDetails';
import RegisterNGOPage from './pages/RegisterNGOPage';
import NGODashboard from './pages/NGODashboard';
import DAOPage from './pages/DAOPage';
import AuthorityDashboard from './pages/AuthorityDashboard';
import WorkerPortal from './pages/WorkerPortal';
import OnrampPage from './pages/OnrampPage';
import DisasterPredictionPage from './pages/DisasterPredictionPage';
import FraudDetectionPage from './pages/FraudDetectionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

/** Redirect unauthenticated users to /login */
function ProtectedRoute({ children, allowedRole }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-emerald-500/30">
      <Navbar />
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/project/:id" element={<ProjectDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/fund" element={<OnrampPage />} />
          <Route path="/predict" element={<DisasterPredictionPage />} />

          {/* Protected – any logged-in user */}
          <Route path="/dao" element={<ProtectedRoute><DAOPage /></ProtectedRoute>} />
          <Route path="/fraud" element={<ProtectedRoute><FraudDetectionPage /></ProtectedRoute>} />
          <Route path="/beneficiary" element={<ProtectedRoute><WorkerPortal /></ProtectedRoute>} />

          {/* Protected – NGO */}
          <Route path="/ngo" element={<NGODashboard />} />
          <Route path="/register" element={<ProtectedRoute allowedRole="ngo"><RegisterNGOPage /></ProtectedRoute>} />

          {/* Protected – Admin */}
          <Route path="/authority" element={<ProtectedRoute allowedRole="admin"><AuthorityDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}
