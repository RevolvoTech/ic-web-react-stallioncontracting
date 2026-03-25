import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import BlankCard from 'src/components/shared/BlankCard';
import { crmRequest } from 'src/api/crm/client';
import { useAuth } from 'src/context/AuthContext';

type Member = {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  globalRole: 'admin' | null;
  orgId: string;
  orgRole: 'employer' | 'employee' | 'investor';
  isActive: boolean;
};

type Invitation = {
  id: string;
  orgId: string;
  email: string;
  role: 'employer' | 'employee' | 'investor';
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expiresAt: string;
  invitedByEmail: string | null;
  invitedUserEmail: string | null;
  createdAt: string;
};

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Team & Roles',
  },
];

const statusChipColor = (status: Invitation['status']) => {
  if (status === 'accepted') {
    return 'success';
  }
  if (status === 'pending') {
    return 'warning';
  }
  if (status === 'expired') {
    return 'default';
  }
  return 'error';
};

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
};

const TeamMembers = () => {
  const { profile, activeOrgId, getAccessToken } = useAuth();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');

  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'employer' | 'employee' | 'investor'>('employee');
  const [inviting, setInviting] = React.useState(false);

  const canManageRoles = Boolean(profile?.permissions.canManageRoles);

  const loadMembers = React.useCallback(async (token: string) => {
    const membersPath = activeOrgId
      ? `/api/users/members?orgId=${encodeURIComponent(activeOrgId)}`
      : '/api/users/members';

    const data = await crmRequest(membersPath, {
      token,
      orgId: activeOrgId,
    });

    setMembers(Array.isArray(data) ? data : []);
  }, [activeOrgId]);

  const loadInvitations = React.useCallback(async (token: string) => {
    if (!canManageRoles) {
      setInvitations([]);
      return;
    }

    const invitationsPath = activeOrgId
      ? `/api/users/invitations?orgId=${encodeURIComponent(activeOrgId)}`
      : '/api/users/invitations';

    const data = await crmRequest(invitationsPath, {
      token,
      orgId: activeOrgId,
    });

    setInvitations(Array.isArray(data) ? data : []);
  }, [activeOrgId, canManageRoles]);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await Promise.all([loadMembers(token), loadInvitations(token)]);
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load team workspace');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, loadInvitations, loadMembers]);

  React.useEffect(() => {
    loadData().catch(() => {
      setLoading(false);
    });
  }, [loadData]);

  const updateMemberRole = async (
    userId: string,
    orgId: string,
    role: 'employer' | 'employee' | 'investor',
  ) => {
    setError('');
    setInfo('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest(`/api/users/members/${userId}/role`, {
        token,
        orgId: activeOrgId,
        method: 'PATCH',
        body: {
          orgId,
          role,
        },
      });

      setMembers((prev) =>
        prev.map((member) =>
          member.userId === userId && member.orgId === orgId ? { ...member, orgRole: role } : member,
        ),
      );
      setInfo('Member role updated.');
    } catch (updateError: any) {
      setError(updateError?.message || 'Role update failed');
    }
  };

  const updateMemberStatus = async (userId: string, orgId: string, isActive: boolean) => {
    setError('');
    setInfo('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest(`/api/users/members/${userId}/status`, {
        token,
        orgId: activeOrgId,
        method: 'PATCH',
        body: {
          orgId,
          isActive,
        },
      });

      setMembers((prev) =>
        prev.map((member) =>
          member.userId === userId && member.orgId === orgId ? { ...member, isActive } : member,
        ),
      );
      setInfo(`Member ${isActive ? 'activated' : 'deactivated'}.`);
    } catch (statusError: any) {
      setError(statusError?.message || 'Status update failed');
    }
  };

  const sendInvitation = async () => {
    setError('');
    setInfo('');
    setInviting(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const result = await crmRequest('/api/users/invitations', {
        token,
        orgId: activeOrgId,
        method: 'POST',
        body: {
          email: inviteEmail,
          role: inviteRole,
          orgId: activeOrgId,
        },
      });

      setInviteEmail('');
      const message = result?.inviteEmailMessage || 'Invitation created.';
      setInfo(message);
      await loadData();
    } catch (inviteError: any) {
      setError(inviteError?.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const resendInvitation = async (invitationId: string) => {
    setError('');
    setInfo('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const result = await crmRequest(`/api/users/invitations/${invitationId}/resend`, {
        token,
        orgId: activeOrgId,
        method: 'POST',
        body: {
          orgId: activeOrgId,
        },
      });

      setInfo(result?.inviteEmailMessage || 'Invitation resent.');
      await loadData();
    } catch (resendError: any) {
      setError(resendError?.message || 'Failed to resend invitation');
    }
  };

  const revokeInvitation = async (invitationId: string) => {
    setError('');
    setInfo('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest(`/api/users/invitations/${invitationId}/revoke`, {
        token,
        orgId: activeOrgId,
        method: 'POST',
        body: {
          orgId: activeOrgId,
        },
      });

      setInfo('Invitation revoked.');
      await loadData();
    } catch (revokeError: any) {
      setError(revokeError?.message || 'Failed to revoke invitation');
    }
  };

  return (
    <PageContainer title="Team & Roles" description="Role-based team management">
      <Breadcrumb title="Team & Roles" items={BCrumb} />
      <BlankCard>
        <Stack spacing={2} p={3}>
          <Typography variant="h5">Organization Members</Typography>
          <Typography variant="body2" color="textSecondary">
            CRM access is invite-only. Employer/Admin can invite members, update roles, and control active status.
          </Typography>
          {!canManageRoles ? (
            <Alert severity="info">You can view members, but only employer/admin can manage invitations and roles.</Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {info ? <Alert severity="success">{info}</Alert> : null}
          {loading ? <Typography>Loading team workspace...</Typography> : null}

          {canManageRoles ? (
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }}>
              <TextField
                label="Invite Email"
                type="email"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                fullWidth
              />
              <FormControl sx={{ minWidth: 180 }}>
                <InputLabel id="invite-role-label">Role</InputLabel>
                <Select
                  labelId="invite-role-label"
                  label="Role"
                  value={inviteRole}
                  onChange={(event) =>
                    setInviteRole(event.target.value as 'employer' | 'employee' | 'investor')
                  }
                >
                  <MenuItem value="employer">employer</MenuItem>
                  <MenuItem value="employee">employee</MenuItem>
                  <MenuItem value="investor">investor</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                onClick={sendInvitation}
                disabled={inviting || !inviteEmail.trim()}
              >
                {inviting ? 'Sending...' : 'Send Invite'}
              </Button>
            </Stack>
          ) : null}

          {!loading ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Global Role</TableCell>
                    <TableCell>Org Role</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => {
                    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
                    return (
                      <TableRow key={`${member.userId}-${member.orgId}`}>
                        <TableCell>{fullName || 'Unnamed user'}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          {member.globalRole ? <Chip size="small" label={member.globalRole} /> : '-'}
                        </TableCell>
                        <TableCell>
                          {canManageRoles ? (
                            <FormControl size="small" sx={{ minWidth: 160 }}>
                              <InputLabel id={`role-label-${member.userId}`}>Org Role</InputLabel>
                              <Select
                                labelId={`role-label-${member.userId}`}
                                label="Org Role"
                                value={member.orgRole}
                                onChange={(event) =>
                                  updateMemberRole(
                                    member.userId,
                                    member.orgId,
                                    event.target.value as 'employer' | 'employee' | 'investor',
                                  )
                                }
                              >
                                <MenuItem value="employer">employer</MenuItem>
                                <MenuItem value="employee">employee</MenuItem>
                                <MenuItem value="investor">investor</MenuItem>
                              </Select>
                            </FormControl>
                          ) : (
                            <Chip size="small" label={member.orgRole} />
                          )}
                        </TableCell>
                        <TableCell>
                          {canManageRoles ? (
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Switch
                                size="small"
                                checked={member.isActive}
                                onChange={(event) =>
                                  updateMemberStatus(member.userId, member.orgId, event.target.checked)
                                }
                              />
                              <Typography variant="body2">
                                {member.isActive ? 'Active' : 'Inactive'}
                              </Typography>
                            </Stack>
                          ) : (
                            <Typography variant="body2">{member.isActive ? 'Active' : 'Inactive'}</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}

          {canManageRoles && !loading ? (
            <Box pt={1}>
              <Typography variant="h6" mb={1}>
                Invitations
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Expires</TableCell>
                      <TableCell>Invited By</TableCell>
                      <TableCell>Accepted User</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell>{invitation.email}</TableCell>
                        <TableCell>
                          <Chip size="small" label={invitation.role} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" color={statusChipColor(invitation.status)} label={invitation.status} />
                        </TableCell>
                        <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                        <TableCell>{invitation.invitedByEmail || '-'}</TableCell>
                        <TableCell>{invitation.invitedUserEmail || '-'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            {(invitation.status === 'pending' || invitation.status === 'expired') ? (
                              <Button size="small" variant="outlined" onClick={() => resendInvitation(invitation.id)}>
                                Resend
                              </Button>
                            ) : null}
                            {(invitation.status === 'pending' || invitation.status === 'expired') ? (
                              <Button size="small" color="error" variant="outlined" onClick={() => revokeInvitation(invitation.id)}>
                                Revoke
                              </Button>
                            ) : null}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invitations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7}>
                          <Typography variant="body2" color="textSecondary">
                            No invitations yet.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : null}
        </Stack>
      </BlankCard>
    </PageContainer>
  );
};

export default TeamMembers;
