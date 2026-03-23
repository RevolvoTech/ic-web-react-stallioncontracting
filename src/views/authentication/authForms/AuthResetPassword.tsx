import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import { useAuth } from 'src/context/AuthContext';
import { supabase } from 'src/lib/supabase';

const AuthResetPassword = () => {
  const navigate = useNavigate();
  const { updatePassword } = useAuth();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [bootstrapping, setBootstrapping] = React.useState(true);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    const setupRecoverySession = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            throw exchangeError;
          }
        }

        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          setError(
            'Recovery session not found. Please open the reset link from your email again.',
          );
        }
      } catch (setupError: any) {
        setError(setupError?.message || 'Could not initialize password recovery session');
      } finally {
        setBootstrapping(false);
      }
    };

    setupRecoverySession().catch(() => {
      setBootstrapping(false);
    });
  }, []);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!password || password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(password);
      setSuccessMessage('Password updated successfully. Redirecting to sign in...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 1200);
    } catch (updateError: any) {
      setError(updateError?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack mt={4} spacing={2} component="form" onSubmit={onSubmit}>
      <CustomFormLabel htmlFor="new-password">New Password</CustomFormLabel>
      <CustomTextField
        id="new-password"
        type="password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
      />
      <CustomFormLabel htmlFor="confirm-password">Confirm Password</CustomFormLabel>
      <CustomTextField
        id="confirm-password"
        type="password"
        variant="outlined"
        fullWidth
        value={confirmPassword}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)}
      />
      {bootstrapping ? <Typography variant="body2">Preparing secure reset session...</Typography> : null}
      {error ? (
        <Typography color="error.main" variant="body2">
          {error}
        </Typography>
      ) : null}
      {successMessage ? (
        <Typography color="success.main" variant="body2">
          {successMessage}
        </Typography>
      ) : null}

      <Button
        color="primary"
        variant="contained"
        size="large"
        fullWidth
        type="submit"
        disabled={loading || bootstrapping}
      >
        {loading ? 'Updating...' : 'Update Password'}
      </Button>
      <Button color="primary" size="large" fullWidth onClick={() => navigate('/auth/login')}>
        Back to Login
      </Button>
    </Stack>
  );
};

export default AuthResetPassword;
