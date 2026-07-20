import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Header from './components/Header';
import TeenVerifyBanner from './components/TeenVerifyBanner';
import OfflineIndicator from './components/OfflineIndicator';
import ProtectedRoute from './components/ProtectedRoute';
import { FloatingActionButtons } from './components/FloatingActionButtons';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { UserDataProvider } from './context/UserDataContext';
import { StoriesProvider } from './context/StoriesContext';
import { GamificationProvider } from './context/GamificationContext';
import { NotesProvider } from './context/NotesContext';
import { AIChatProvider } from './context/AIChatContext';
import { NotificationProvider } from './context/NotificationContext';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignUpPage = lazy(() => import('./pages/SignUpPage'));
const SkillsPage = lazy(() => import('./pages/SkillsPage'));
const SkillDetailPage = lazy(() => import('./pages/SkillDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const RealLifeStoriesPage = lazy(() => import('./pages/RealLifeStoriesPage'));
const StoryDetailPage = lazy(() => import('./pages/StoryDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const NotesPage = lazy(() => import('./pages/NotesPage'));
const VerifyParentPage = lazy(() => import('./pages/VerifyParentPage'));
const ParentDashboardPage = lazy(() => import('./pages/ParentDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotificationPage = lazy(() => import('./pages/NotificationPage'));
const AIChatBot = lazy(() => import('./components/AIChatBot'));

// Loading component
const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen bg-[#0D1117] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary-green"></div>
    </div>
);

const AppContent: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#0D1117] relative overflow-hidden">
            {/* Video Background for entire app - Optimized */}
            <video
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="fixed inset-0 w-full h-full object-cover opacity-20 z-0 gpu-accelerated"
                style={{
                    willChange: 'auto',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden'
                }}
            >
                <source src="/Afterbell-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Background overlay for entire app */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/60 to-slate-900/80 z-0" />

            <Header />
            <OfflineIndicator />
            <TeenVerifyBanner />

            {/* Main Content */}
            <main className="pt-20 relative z-10 smooth-scroll">
                <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/signup" element={<SignUpPage />} />
                        <Route path="/verify-parent" element={<VerifyParentPage />} />
                        <Route path="/parent/dashboard" element={
                            <ProtectedRoute>
                                <ParentDashboardPage />
                            </ProtectedRoute>
                        } />

                        {/* Admin routes */}
                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminDashboardPage />
                            </ProtectedRoute>
                        } />

                        {/* Protected routes */}
                        <Route path="/skills" element={
                            <ProtectedRoute>
                                <SkillsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/skills/:skillId" element={
                            <ProtectedRoute>
                                <SkillDetailPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        } />
                        <Route path="/stories" element={
                            <ProtectedRoute>
                                <RealLifeStoriesPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/stories/:storyId" element={
                            <ProtectedRoute>
                                <StoryDetailPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/analytics" element={
                            <ProtectedRoute>
                                <AnalyticsPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/notes" element={
                            <ProtectedRoute>
                                <NotesPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/badges" element={<Navigate to="/profile" replace />} />
                        <Route path="/notifications" element={
                            <ProtectedRoute>
                                <NotificationPage />
                            </ProtectedRoute>
                        } />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </main>

            {/* Floating Action Buttons */}
            <FloatingActionButtons />
            <Suspense fallback={null}>
                <AIChatBot />
            </Suspense>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <UserDataProvider>
                <StoriesProvider>
                    <GamificationProvider>
                        <NotesProvider>
                            <AIChatProvider>
                            <NotificationProvider>
                            <ToastProvider>
                                <Router>
                                    <AppContent />
                                </Router>
                            </ToastProvider>
                            </NotificationProvider>
                            </AIChatProvider>
                        </NotesProvider>
                    </GamificationProvider>
                </StoriesProvider>
            </UserDataProvider>
        </AuthProvider>
    );
};

export default App; 