import React from 'react';
import { Navigate } from 'react-router';
import { useLocation } from 'react-router';
import { Box, Button, Stack, Typography } from '@mui/material';
import Spinner from 'src/views/spinner/Spinner';
import { useAuth } from 'src/context/AuthContext';

const AuthErrorScreen: React.FC<{
  message: string;
  onBackToLogin: () => Promise<void>;
}> = ({ message, onBackToLogin }) => (
  <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" px={3}>
    <Stack spacing={2} maxWidth={520} width="100%">
      <Typography variant="h4">CRM Access Error</Typography>
      <Typography variant="body1" color="textSecondary">
        {message}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Refresh
        </Button>
        <Button variant="outlined" onClick={() => void onBackToLogin()}>
          Back to Login
        </Button>
      </Stack>
    </Stack>
  </Box>
);

export const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const location = useLocation();
  const { loading, profileLoading, session, profile, authError, signOut } = useAuth();

  if (loading || (session && profileLoading)) {
    return <Spinner />;
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!profile) {
    return (
      <AuthErrorScreen
        message={authError || 'Your CRM profile could not be loaded. Refresh to try again or sign in again.'}
        onBackToLogin={async () => {
          try {
            await signOut();
          } finally {
            window.location.assign('/auth/login');
          }
        }}
      />
    );
  }

  const isOnboardingRoute = location.pathname === '/onboarding';
  const needsOnboarding = !profile.user.onboardingCompleted;

  if (needsOnboarding && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!needsOnboarding && isOnboardingRoute) {
    return <Navigate to="/dashboards/modern" replace />;
  }

  return children;
};

export const RequireGuest: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { loading, profileLoading, session, profile } = useAuth();

  if (loading || (session && profileLoading)) {
    return <Spinner />;
  }

  if (session && profile) {
    return <Navigate to="/dashboards/modern" replace />;
  }

  return children;
};
