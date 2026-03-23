// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Box, Typography, Button, Divider, Stack } from '@mui/material';
import { useNavigate } from 'react-router';

import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';
import { registerType } from 'src/types/auth/auth';
import AuthSocialButtons from './AuthSocialButtons';
import { useAuth } from 'src/context/AuthContext';


const AuthRegister = ({ title, subtitle, subtext }: registerType) => {
  const navigate = useNavigate();
  const { signUp, signInWithProvider } = useAuth();
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const result = await signUp(email, password, firstName, lastName);
      if (result.needsEmailVerification) {
        setSuccessMessage(
          `Account created. Please verify your email (${result.email}) before signing in.`,
        );
      } else {
        setSuccessMessage('Account created. Redirecting to your CRM workspace...');
        navigate('/');
      }
      setPassword('');
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithProvider('google');
    } catch (submitError: any) {
      setError(submitError?.message || 'Google sign-up failed');
      setSubmitting(false);
    }
  };

  const handleFacebookSignUp = async () => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithProvider('facebook');
    } catch (submitError: any) {
      setError(submitError?.message || 'Facebook sign-up failed');
      setSubmitting(false);
    }
  };

  return (
    <>
    {title ? (
      <Typography fontWeight="700" variant="h3" mb={1}>
        {title}
      </Typography>
    ) : null}

    {subtext}
    <AuthSocialButtons
      title="Sign up with"
      onGoogleClick={handleGoogleSignUp}
      onFacebookClick={handleFacebookSignUp}
      disabled={submitting}
    />

    <Box mt={3}>
      <Divider>
        <Typography
          component="span"
          color="textSecondary"
          variant="h6"
          fontWeight="400"
          position="relative"
          px={2}
        >
          or sign up with
        </Typography>
      </Divider>
    </Box>

    <Box component="form" onSubmit={onSubmit}>
      <Stack mb={3}>
        <CustomFormLabel htmlFor="name">Name</CustomFormLabel>
        <CustomTextField
          id="name"
          variant="outlined"
          fullWidth
          value={firstName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)}
        />
        <CustomFormLabel htmlFor="lastname">Last Name</CustomFormLabel>
        <CustomTextField
          id="lastname"
          variant="outlined"
          fullWidth
          value={lastName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setLastName(event.target.value)}
        />
        <CustomFormLabel htmlFor="email">Email Address</CustomFormLabel>
        <CustomTextField
          id="email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        />
        <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
        <CustomTextField
          id="password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
        />
        {error ? (
          <Typography color="error.main" variant="body2" mt={1}>
            {error}
          </Typography>
        ) : null}
        {successMessage ? (
          <Typography color="success.main" variant="body2" mt={1}>
            {successMessage}
          </Typography>
        ) : null}
      </Stack>
      <Button color="primary" variant="contained" size="large" fullWidth type="submit" disabled={submitting}>
        {submitting ? 'Creating account...' : 'Sign Up'}
      </Button>
    </Box>
    {subtitle}
  </>
  );
};

export default AuthRegister;
