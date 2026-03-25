import React from 'react';
import { Alert, Box, Button, CardContent, Grid, Stack, Typography } from '@mui/material';
import BlankCard from '../../shared/BlankCard';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import CustomTextField from '../../forms/theme-elements/CustomTextField';
import { useAuth } from 'src/context/AuthContext';

const SecurityTab = () => {
  const { updatePassword } = useAuth();
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');

  const handleUpdatePassword = async () => {
    setError('');
    setSuccess('');

    if (!newPassword || newPassword.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password confirmation does not match');
      return;
    }

    setSaving(true);
    try {
      await updatePassword(newPassword);
      setSuccess('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (passwordError: any) {
      setError(passwordError?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Grid container spacing={3} justifyContent="center">
      <Grid
        size={{
          xs: 12,
          lg: 8,
        }}
      >
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Change Password
            </Typography>
            <Typography color="textSecondary" mb={3}>
              Use a strong password to secure your CRM account
            </Typography>

            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

            <Box>
              <CustomFormLabel sx={{ mt: 0 }} htmlFor="security-new-password">
                New Password
              </CustomFormLabel>
              <CustomTextField
                id="security-new-password"
                type="password"
                value={newPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPassword(event.target.value)}
                fullWidth
              />

              <CustomFormLabel htmlFor="security-confirm-password">Confirm New Password</CustomFormLabel>
              <CustomTextField
                id="security-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  setConfirmPassword(event.target.value)
                }
                fullWidth
              />
            </Box>
          </CardContent>
        </BlankCard>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'end' }} mt={3}>
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={handleUpdatePassword}
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Password'}
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default SecurityTab;
