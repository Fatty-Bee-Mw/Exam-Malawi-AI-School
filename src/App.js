import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserLimitsProvider } from './contexts/UserLimitsContext';
import { UserStatsProvider } from './contexts/UserStatsContext';
import { AdminProvider } from './contexts/AdminContext';

const Dashboard = lazy(() => import('./components/Dashboard'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./components/TermsOfService'));
const CookiePolicy = lazy(() => import('./components/CookiePolicy'));

function PageLoader() {
  return (
    <div className="h-dvh flex items-center justify-center bg-dark-primary">
      <div className="h-8 w-8 border-2 border-dark-neon-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <PageLoader />;
  return currentUser ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { currentUser, loading } = useAuth();

  if (loading) return <PageLoader />;

  return (
    <Router>
      <UserLimitsProvider>
        <UserStatsProvider>
          <AdminProvider>
            <div className="h-dvh overflow-hidden bg-dark-primary flex flex-col">
              {currentUser && <Navbar />}
              <div className={`flex-1 min-h-0 overflow-hidden ${currentUser ? '' : 'h-full'}`}>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/cookies" element={<CookiePolicy />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </Suspense>
              </div>
            </div>
          </AdminProvider>
        </UserStatsProvider>
      </UserLimitsProvider>
    </Router>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
