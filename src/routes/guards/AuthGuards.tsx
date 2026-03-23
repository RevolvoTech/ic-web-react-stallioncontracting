import React from 'react';
import { Navigate } from 'react-router';
import { useLocation } from 'react-router';
import Spinner from 'src/views/spinner/Spinner';
import { useAuth } from 'src/context/AuthContext';

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  const { loading, profileLoading, session, profile } = useAuth();

  if (loading || (session && profileLoading)) {
    return <Spinner />;
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  const isOnboardingRoute = location.pathname === '/onboarding';
  const needsOnboarding = Boolean(profile && !profile.user.onboardingCompleted);

  if (needsOnboarding && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!needsOnboarding && isOnboardingRoute) {
    return <Navigate to="/dashboards/modern" replace />;
  }

  return children;
};

export const RequireGuest: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { loading, session } = useAuth();

  if (loading) {
    return <Spinner />;
  }

  if (session) {
    return <Navigate to="/dashboards/modern" replace />;
  }

  return children;
};
