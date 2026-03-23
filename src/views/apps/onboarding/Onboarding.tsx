import React from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import { useAuth } from 'src/context/AuthContext';
import { crmRequest } from 'src/api/crm/client';

const Onboarding = () => {
  const navigate = useNavigate();
  const { profile, activeOrgId, getAccessToken, refreshProfile } = useAuth();

  const [firstName, setFirstName] = React.useState(profile?.user.firstName || '');
  const [lastName, setLastName] = React.useState(profile?.user.lastName || '');
  const [phone, setPhone] = React.useState(profile?.user.phone || '');
  const [jobTitle, setJobTitle] = React.useState(profile?.user.jobTitle || '');
  const [organizationName, setOrganizationName] = React.useState(profile?.activeOrg.orgName || '');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  React.useEffect(() => {
    setFirstName(profile?.user.firstName || '');
    setLastName(profile?.user.lastName || '');
    setPhone(profile?.user.phone || '');
    setJobTitle(profile?.user.jobTitle || '');
    setOrganizationName(profile?.activeOrg.orgName || '');
  }, [profile]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest('/api/auth/onboarding', {
        token,
        orgId: activeOrgId,
        method: 'PATCH',
        body: {
          firstName,
          lastName,
          phone,
          jobTitle,
          organizationName,
        },
      });

      await refreshProfile();
      setSuccessMessage('Onboarding completed. Redirecting to CRM...');
      setTimeout(() => navigate('/apps/contacts'), 800);
    } catch (submitError: any) {
      setError(submitError?.message || 'Could not complete onboarding');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer title="Onboarding" description="CRM onboarding">
      <Grid container justifyContent="center">
        <Grid size={{ xs: 12, md: 8, lg: 6 }}>
          <BlankCard sx={{ p: 4 }}>
            <Typography variant="h3" mb={1}>
              Complete Your CRM Setup
            </Typography>
            <Typography variant="body2" color="textSecondary" mb={3}>
              Add your profile and organization details to finish onboarding.
            </Typography>

            <Stack component="form" spacing={2} onSubmit={handleSubmit}>
              <TextField
                label="First Name"
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Last Name"
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="Phone"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                fullWidth
              />
              <TextField
                label="Job Title"
                value={jobTitle}
                onChange={(event) => setJobTitle(event.target.value)}
                fullWidth
              />
              <TextField
                label="Organization Name"
                value={organizationName}
                onChange={(event) => setOrganizationName(event.target.value)}
                fullWidth
              />

              {profile ? (
                <Alert severity="info">
                  Your current role is <strong>{profile.activeOrg.orgRole || 'unassigned'}</strong>.
                </Alert>
              ) : null}
              {error ? <Alert severity="error">{error}</Alert> : null}
              {successMessage ? <Alert severity="success">{successMessage}</Alert> : null}

              <Box>
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Finish Onboarding'}
                </Button>
              </Box>
            </Stack>
          </BlankCard>
        </Grid>
      </Grid>
    </PageContainer>
  );
};

export default Onboarding;
