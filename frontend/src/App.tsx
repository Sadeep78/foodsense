import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { ForecastPage } from './pages/ForecastPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { InsightsPage } from './pages/InsightsPage';
import { DonationsPage } from './pages/DonationsPage';
import { GoalsPage } from './pages/GoalsPage';
import { MarginsPage } from './pages/MarginsPage';
import { EventsPage } from './pages/EventsPage';
import { SustainabilityPage } from './pages/SustainabilityPage';
import { OutletsPage } from './pages/OutletsPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { RecipesPage } from './pages/RecipesPage';
import { QuickLogPage } from './pages/QuickLogPage';
import { LanguageProvider } from './context/LanguageContext';
import { SidebarProvider, useSidebar } from './context/SidebarContext';
import { PitchModeProvider } from './context/PitchModeContext';
import { MotionProvider } from './context/MotionContext';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isCollapsed, isMobileOpen, closeMobile, toggleMobile } = useSidebar();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-500">
        Loading FoodSense...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#080d1a] flex">
      {/* Sidebar */}
      <Sidebar isOpen={isMobileOpen} onClose={closeMobile} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-[280px]'
        } transition-all duration-200 ease-in-out`}
      >
        <Header onToggleSidebar={toggleMobile} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <PitchModeProvider>
        <MotionProvider>
          <LanguageProvider>
            <AuthProvider>
              <SidebarProvider>
                <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <DashboardPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/insights"
              element={
                <ProtectedLayout>
                  <InsightsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/donations"
              element={
                <ProtectedLayout>
                  <DonationsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/goals"
              element={
                <ProtectedLayout>
                  <GoalsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedLayout>
                  <UploadPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/forecasts"
              element={
                <ProtectedLayout>
                  <ForecastPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/events"
              element={
                <ProtectedLayout>
                  <EventsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/margins"
              element={
                <ProtectedLayout>
                  <MarginsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedLayout>
                  <RecommendationsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/alerts"
              element={
                <ProtectedLayout>
                  <AlertsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/sustainability"
              element={
                <ProtectedLayout>
                  <SustainabilityPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedLayout>
                  <ReportsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/outlets"
              element={
                <ProtectedLayout>
                  <OutletsPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/suppliers"
              element={
                <ProtectedLayout>
                  <SuppliersPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/recipes"
              element={
                <ProtectedLayout>
                  <RecipesPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/quick-log"
              element={
                <ProtectedLayout>
                  <QuickLogPage />
                </ProtectedLayout>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedLayout>
                  <SettingsPage />
                </ProtectedLayout>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
              </SidebarProvider>
            </AuthProvider>
          </LanguageProvider>
        </MotionProvider>
      </PitchModeProvider>
    </ThemeProvider>
  );
}

export default App;
