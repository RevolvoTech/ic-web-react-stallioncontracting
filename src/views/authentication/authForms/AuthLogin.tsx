// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import {
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Button,
  Stack,
} from '@mui/material';
import { Link } from 'react-router';
import { useNavigate } from 'react-router';

import { loginType } from 'src/types/auth/auth';
import CustomCheckbox from '../../../components/forms/theme-elements/CustomCheckbox';
import CustomTextField from '../../../components/forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../../components/forms/theme-elements/CustomFormLabel';

import { useAuth } from 'src/context/AuthContext';



const AuthLogin = ({ title, subtitle, subtext }: loginType) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
      navigate('/');
    } catch (submitError: any) {
      const rawMessage = submitError?.message || 'Failed to sign in';
      if (String(rawMessage).toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before signing in. Check your inbox and spam folder.');
      } else {
        setError(rawMessage);
      }
    } finally {
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

    <Stack component="form" onSubmit={onSubmit}>
      <Box>
        <CustomFormLabel htmlFor="email">Email</CustomFormLabel>
        <CustomTextField
          id="email"
          type="email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
        />
      </Box>
      <Box>
        <CustomFormLabel htmlFor="password">Password</CustomFormLabel>
        <CustomTextField
          id="password"
          type="password"
          variant="outlined"
          fullWidth
          value={password}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)}
        />
      </Box>
      <Stack justifyContent="space-between" direction="row" alignItems="center" my={2}>
        <FormGroup>
          <FormControlLabel
            control={<CustomCheckbox defaultChecked />}
            label="Remember this device"
          />
        </FormGroup>
        <Typography
          component={Link}
          to="/auth/forgot-password"
          fontWeight="500"
          sx={{
            textDecoration: 'none',
            color: 'primary.main',
          }}
        >
          Forgot Password?
        </Typography>
      </Stack>
      {error ? (
        <Typography color="error.main" variant="body2" mb={2}>
          {error}
        </Typography>
      ) : null}
      <Box>
        <Button
          color="primary"
          variant="contained"
          size="large"
          fullWidth
          type="submit"
          disabled={submitting}
        >
          {submitting ? 'Signing in...' : 'Sign In'}
        </Button>
      </Box>
    </Stack>
    {subtitle}
  </>
  );
};

export default AuthLogin;
