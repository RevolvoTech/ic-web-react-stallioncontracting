// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { Link } from 'react-router';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import { useAuth } from 'src/context/AuthContext';

const AuthForgotPassword = () => {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSuccessMessage('Password reset link sent. Check your inbox and spam folder.');
    } catch (resetError: any) {
      setError(resetError?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack mt={4} spacing={2} component="form" onSubmit={handleSubmit}>
        <CustomFormLabel htmlFor="reset-email">Email Address</CustomFormLabel>
        <CustomTextField
          id="reset-email"
          type="email"
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
          variant="outlined"
          fullWidth
        />
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

        <Button color="primary" variant="contained" size="large" fullWidth type="submit" disabled={loading}>
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <Button color="primary" size="large" fullWidth component={Link} to="/auth/login">
          Back to Login
        </Button>
      </Stack>
    </>
  );
};

export default AuthForgotPassword;
