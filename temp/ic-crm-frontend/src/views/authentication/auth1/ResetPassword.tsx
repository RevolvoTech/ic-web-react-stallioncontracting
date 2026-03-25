import { Grid, Box, Typography } from '@mui/material';
import Logo from 'src/layouts/full/shared/logo/Logo';
import PageContainer from 'src/components/container/PageContainer';
import img1 from 'src/assets/images/backgrounds/login-bg.svg';
import AuthResetPassword from '../authForms/AuthResetPassword';

const ResetPassword = () => (
  <PageContainer title="Reset Password" description="Reset password page">
    <Grid container justifyContent="center" spacing={0} sx={{ overflowX: 'hidden' }}>
      <Grid
        sx={{
          position: 'relative',
          '&:before': {
            content: '""',
            background: 'radial-gradient(#d2f1df, #d3d7fa, #bad8f4)',
            backgroundSize: '400% 400%',
            animation: 'gradient 15s ease infinite',
            position: 'absolute',
            height: '100%',
            width: '100%',
            opacity: '0.3',
          },
        }}
        size={{
          xs: 12,
          sm: 12,
          lg: 8,
          xl: 9,
        }}
      >
        <Box position="relative">
          <Box px={3}>
            <Logo />
          </Box>
          <Box
            alignItems="center"
            justifyContent="center"
            height={'calc(100vh - 75px)'}
            sx={{
              display: {
                xs: 'none',
                lg: 'flex',
              },
            }}
          >
            <img
              src={img1}
              alt="bg"
              style={{
                width: '100%',
                maxWidth: '500px',
              }}
            />
          </Box>
        </Box>
      </Grid>
      <Grid
        display="flex"
        justifyContent="center"
        alignItems="center"
        size={{
          xs: 12,
          sm: 12,
          lg: 4,
          xl: 3,
        }}
      >
        <Box p={4}>
          <Typography variant="h4" fontWeight="700">
            Set a new password
          </Typography>
          <Typography color="textSecondary" variant="subtitle2" fontWeight="400" mt={2}>
            Enter a new secure password to finish your account recovery.
          </Typography>
          <AuthResetPassword />
        </Box>
      </Grid>
    </Grid>
  </PageContainer>
);

export default ResetPassword;
