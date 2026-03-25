import React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CardContent,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import BlankCard from '../../shared/BlankCard';
import CustomTextField from '../../forms/theme-elements/CustomTextField';
import CustomFormLabel from '../../forms/theme-elements/CustomFormLabel';
import { useAuth } from 'src/context/AuthContext';
import { crmRequest } from 'src/api/crm/client';

type ProfileForm = {
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  organizationName: string;
};

const getInitialForm = (): ProfileForm => ({
  firstName: '',
  lastName: '',
  phone: '',
  jobTitle: '',
  organizationName: '',
});

const AccountTab = () => {
  const { profile, activeOrgId, getAccessToken, refreshProfile } = useAuth();
  const [form, setForm] = React.useState<ProfileForm>(getInitialForm());
  const [saving, setSaving] = React.useState(false);
  const [avatarSaving, setAvatarSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [success, setSuccess] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!profile) {
      setForm(getInitialForm());
      return;
    }

    setForm({
      firstName: profile.user.firstName || '',
      lastName: profile.user.lastName || '',
      phone: profile.user.phone || '',
      jobTitle: profile.user.jobTitle || '',
      organizationName: profile.activeOrg.orgName || '',
    });
  }, [profile]);

  const displayName = `${form.firstName} ${form.lastName}`.trim() || profile?.user.email || 'User';
  const avatarUrl =
    profile?.user.avatarUrl ||
    `https://ui-avatars.com/api/?background=1976d2&color=fff&name=${encodeURIComponent(displayName)}`;
  const canRenameOrg = Boolean(profile?.permissions.canManageRoles);

  const setField =
    (field: keyof ProfileForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  const resetForm = () => {
    if (!profile) {
      setForm(getInitialForm());
      return;
    }
    setError('');
    setSuccess('');
    setForm({
      firstName: profile.user.firstName || '',
      lastName: profile.user.lastName || '',
      phone: profile.user.phone || '',
      jobTitle: profile.user.jobTitle || '',
      organizationName: profile.activeOrg.orgName || '',
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      if (!form.firstName.trim() || !form.lastName.trim()) {
        throw new Error('First name and last name are required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest('/api/auth/profile', {
        token,
        orgId: activeOrgId,
        method: 'PATCH',
        body: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          phone: form.phone.trim(),
          jobTitle: form.jobTitle.trim(),
          organizationName: form.organizationName.trim(),
        },
      });

      await refreshProfile();
      setSuccess('Profile updated successfully');
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const value = String(reader.result || '');
        const commaIndex = value.indexOf(',');
        resolve(commaIndex >= 0 ? value.slice(commaIndex + 1) : value);
      };
      reader.onerror = () => reject(new Error('Failed to read image file'));
      reader.readAsDataURL(file);
    });

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setAvatarSaving(true);
    setError('');
    setSuccess('');
    try {
      const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
      if (!allowedTypes.has(file.type)) {
        throw new Error('Only JPG, PNG, and WEBP images are allowed');
      }

      const base64 = await fileToBase64(file);
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest('/api/auth/profile/avatar', {
        token,
        orgId: activeOrgId,
        method: 'POST',
        body: {
          fileName: file.name,
          mimeType: file.type,
          contentBase64: base64,
        },
      });

      await refreshProfile();
      setSuccess('Profile picture updated successfully');
    } catch (uploadError: any) {
      setError(uploadError?.message || 'Failed to upload profile picture');
    } finally {
      setAvatarSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarRemove = async () => {
    setAvatarSaving(true);
    setError('');
    setSuccess('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest('/api/auth/profile/avatar', {
        token,
        orgId: activeOrgId,
        method: 'DELETE',
        body: {},
      });

      await refreshProfile();
      setSuccess('Profile picture removed successfully');
    } catch (removeError: any) {
      setError(removeError?.message || 'Failed to remove profile picture');
    } finally {
      setAvatarSaving(false);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid
        size={{
          xs: 12,
          lg: 4,
        }}
      >
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Profile
            </Typography>
            <Typography color="textSecondary" mb={3}>
              Your CRM account identity
            </Typography>
            <Box textAlign="center">
              <Avatar
                src={avatarUrl}
                alt={displayName}
                sx={{ width: 100, height: 100, margin: '0 auto 16px auto' }}
              />
              <Typography variant="h6">{displayName}</Typography>
              <Typography variant="body2" color="textSecondary">
                {profile?.user.email}
              </Typography>
              <Typography variant="body2" color="textSecondary" mt={1}>
                Role: {profile?.activeOrg.orgRole || 'member'}
              </Typography>
              <Stack direction="row" spacing={1} justifyContent="center" mt={2}>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={avatarSaving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {avatarSaving ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  color="error"
                  disabled={avatarSaving || !profile?.user.avatarStoragePath}
                  onClick={handleAvatarRemove}
                >
                  Remove
                </Button>
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                style={{ display: 'none' }}
                onChange={handleAvatarUpload}
              />
            </Box>
          </CardContent>
        </BlankCard>
      </Grid>

      <Grid
        size={{
          xs: 12,
          lg: 8,
        }}
      >
        <BlankCard>
          <CardContent>
            <Typography variant="h5" mb={1}>
              Personal Details
            </Typography>
            <Typography color="textSecondary" mb={3}>
              Update your account and organization details
            </Typography>

            {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
            {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

            <Grid container spacing={3}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel sx={{ mt: 0 }} htmlFor="profile-first-name">
                  First Name
                </CustomFormLabel>
                <CustomTextField
                  id="profile-first-name"
                  value={form.firstName}
                  onChange={setField('firstName')}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel sx={{ mt: 0 }} htmlFor="profile-last-name">
                  Last Name
                </CustomFormLabel>
                <CustomTextField
                  id="profile-last-name"
                  value={form.lastName}
                  onChange={setField('lastName')}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel sx={{ mt: 0 }} htmlFor="profile-email">
                  Email
                </CustomFormLabel>
                <CustomTextField
                  id="profile-email"
                  value={profile?.user.email || ''}
                  variant="outlined"
                  fullWidth
                  disabled
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel sx={{ mt: 0 }} htmlFor="profile-phone">
                  Phone
                </CustomFormLabel>
                <CustomTextField
                  id="profile-phone"
                  value={form.phone}
                  onChange={setField('phone')}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel sx={{ mt: 0 }} htmlFor="profile-job-title">
                  Job Title
                </CustomFormLabel>
                <CustomTextField
                  id="profile-job-title"
                  value={form.jobTitle}
                  onChange={setField('jobTitle')}
                  variant="outlined"
                  fullWidth
                />
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <CustomFormLabel sx={{ mt: 0 }} htmlFor="profile-org-name">
                  Organization Name
                </CustomFormLabel>
                <CustomTextField
                  id="profile-org-name"
                  value={form.organizationName}
                  onChange={setField('organizationName')}
                  variant="outlined"
                  fullWidth
                  disabled={!canRenameOrg}
                />
                {!canRenameOrg ? (
                  <Typography variant="caption" color="textSecondary">
                    Only employer/admin can rename organization.
                  </Typography>
                ) : null}
              </Grid>
            </Grid>
          </CardContent>
        </BlankCard>
        <Stack direction="row" spacing={2} sx={{ justifyContent: 'end' }} mt={3}>
          <Button size="large" variant="contained" color="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button size="large" variant="text" color="error" onClick={resetForm} disabled={saving}>
            Reset
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AccountTab;
