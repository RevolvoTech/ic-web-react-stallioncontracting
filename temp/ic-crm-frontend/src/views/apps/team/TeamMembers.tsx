import React from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
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
import {
  getReadableTextColor,
  hexToRgba,
  isHexColor,
  PROJECT_TYPE_COLOR_PRESETS,
  resolveUiColor,
} from 'src/lib/projectTypeColors';

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

type TeamItem = {
  id: string;
  orgId: string;
  name: string;
  description: string;
  color: string;
  memberCount: number;
  projectCount: number;
  ticketCount: number;
  members: Array<{
    userId: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    fullName: string;
  }>;
};

type TeamForm = {
  name: string;
  description: string;
  color: string;
  memberUserIds: string[];
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

const emptyTeamForm: TeamForm = {
  name: '',
  description: '',
  color: '#2563eb',
  memberUserIds: [],
};

const normalizeColorInput = (value: string) => {
  const normalized = String(value || '')
    .trim()
    .replace(/^#/, '')
    .replace(/[^0-9a-f]/gi, '')
    .slice(0, 6)
    .toLowerCase();

  return normalized ? `#${normalized}` : '';
};

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

const sectionCardSx = {
  p: 3,
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
  backgroundColor: 'background.paper',
};

const tableHeadCellSx = {
  fontSize: '0.75rem',
  fontWeight: 700,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  borderBottomColor: 'divider',
};

const TeamMembers = () => {
  const { profile, activeOrgId, getAccessToken, setActiveOrgId } = useAuth();
  const [members, setMembers] = React.useState<Member[]>([]);
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [teams, setTeams] = React.useState<TeamItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');

  const [inviteEmail, setInviteEmail] = React.useState('');
  const [inviteRole, setInviteRole] = React.useState<'employer' | 'employee' | 'investor'>('employee');
  const [inviting, setInviting] = React.useState(false);

  const [teamDialogOpen, setTeamDialogOpen] = React.useState(false);
  const [editingTeamId, setEditingTeamId] = React.useState<string | null>(null);
  const [teamForm, setTeamForm] = React.useState<TeamForm>(emptyTeamForm);
  const [savingTeam, setSavingTeam] = React.useState(false);

  const canManageRoles = Boolean(profile?.permissions.canManageRoles);
  const fallbackOrgId =
    activeOrgId || profile?.activeOrg.orgId || profile?.user.defaultOrgId || profile?.memberships?.[0]?.org_id || null;
  const resolvedOrgId = activeOrgId || fallbackOrgId;
  const resolvedOrgName =
    profile?.activeOrg.orgName ||
    profile?.memberships?.find((membership) => membership.org_id === resolvedOrgId)?.org_name ||
    null;
  const resolvedColor = resolveUiColor(teamForm.color || '#2563eb');
  const isValidColor = isHexColor(teamForm.color);
  const activeMembers = members.filter((member) => member.isActive);
  const selectableTeamMembers = members.filter(
    (member) => member.isActive || teamForm.memberUserIds.includes(member.userId),
  );
  const selectedTeamMembers = selectableTeamMembers.filter((member) =>
    teamForm.memberUserIds.includes(member.userId),
  );
  const pendingInvitationCount = invitations.filter((invitation) => invitation.status === 'pending').length;
  const teamMembershipsByUserId = teams.reduce<Record<string, TeamItem[]>>((accumulator, team) => {
    team.members.forEach((member) => {
      if (!accumulator[member.userId]) {
        accumulator[member.userId] = [];
      }
      accumulator[member.userId].push(team);
    });

    return accumulator;
  }, {});

  React.useEffect(() => {
    if (!activeOrgId && resolvedOrgId) {
      void setActiveOrgId(resolvedOrgId);
    }
  }, [activeOrgId, resolvedOrgId, setActiveOrgId]);

  const getMemberName = (member: Member) =>
    `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;

  const loadMembers = React.useCallback(
    async (token: string) => {
      if (!resolvedOrgId) {
        setMembers([]);
        return;
      }

      const data = await crmRequest(`/api/users/members?orgId=${encodeURIComponent(resolvedOrgId)}`, {
        token,
        orgId: resolvedOrgId,
      });

      setMembers(Array.isArray(data) ? (data as Member[]) : []);
    },
    [resolvedOrgId],
  );

  const loadInvitations = React.useCallback(
    async (token: string) => {
      if (!canManageRoles || !resolvedOrgId) {
        setInvitations([]);
        return;
      }

      const data = await crmRequest(`/api/users/invitations?orgId=${encodeURIComponent(resolvedOrgId)}`, {
        token,
        orgId: resolvedOrgId,
      });

      setInvitations(Array.isArray(data) ? (data as Invitation[]) : []);
    },
    [canManageRoles, resolvedOrgId],
  );

  const loadTeams = React.useCallback(
    async (token: string) => {
      if (!resolvedOrgId) {
        setTeams([]);
        return;
      }

      const data = await crmRequest(`/api/teams?orgId=${encodeURIComponent(resolvedOrgId)}`, {
        token,
        orgId: resolvedOrgId,
      });

      setTeams(Array.isArray(data) ? (data as TeamItem[]) : []);
    },
    [resolvedOrgId],
  );

  const loadData = React.useCallback(async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (!resolvedOrgId) {
        setMembers([]);
        setInvitations([]);
        setTeams([]);
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await Promise.all([loadMembers(token), loadInvitations(token), loadTeams(token)]);
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load team workspace');
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, loadInvitations, loadMembers, loadTeams, resolvedOrgId]);

  React.useEffect(() => {
    loadData().catch(() => {
      setLoading(false);
    });
  }, [loadData]);

  const openCreateTeam = () => {
    setEditingTeamId(null);
    setTeamForm(emptyTeamForm);
    setTeamDialogOpen(true);
  };

  const openEditTeam = (team: TeamItem) => {
    setEditingTeamId(team.id);
    setTeamForm({
      name: team.name,
      description: team.description || '',
      color: team.color,
      memberUserIds: team.members.map((member) => member.userId),
    });
    setTeamDialogOpen(true);
  };

  const saveTeam = async () => {
    setSavingTeam(true);
    setError('');
    setInfo('');

    try {
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const body = {
        orgId: resolvedOrgId,
        name: teamForm.name.trim(),
        description: teamForm.description.trim(),
        color: teamForm.color,
        memberUserIds: teamForm.memberUserIds,
      };

      const data = editingTeamId
        ? await crmRequest(`/api/teams/${editingTeamId}`, {
            token,
            orgId: resolvedOrgId,
            method: 'PATCH',
            body,
          })
        : await crmRequest('/api/teams', {
            token,
            orgId: resolvedOrgId,
            method: 'POST',
            body,
          });

      setTeams(Array.isArray(data) ? (data as TeamItem[]) : []);
      setInfo(editingTeamId ? 'Team updated.' : 'Team created.');
      setTeamDialogOpen(false);
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save team');
    } finally {
      setSavingTeam(false);
    }
  };

  const deleteTeam = async (teamId: string) => {
    setError('');
    setInfo('');
    try {
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const data = await crmRequest(`/api/teams/${teamId}`, {
        token,
        orgId: resolvedOrgId,
        method: 'DELETE',
        body: {
          orgId: resolvedOrgId,
        },
      });

      setTeams(Array.isArray(data) ? (data as TeamItem[]) : []);
      setInfo('Team deleted.');
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete team');
    }
  };

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
        orgId: resolvedOrgId,
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
        orgId: resolvedOrgId,
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
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const result = await crmRequest('/api/users/invitations', {
        token,
        orgId: resolvedOrgId,
        method: 'POST',
        body: {
          email: inviteEmail,
          role: inviteRole,
          orgId: resolvedOrgId,
        },
      });

      setInviteEmail('');
      setInfo(result?.inviteEmailMessage || 'Invitation created.');
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
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const result = await crmRequest(`/api/users/invitations/${invitationId}/resend`, {
        token,
        orgId: resolvedOrgId,
        method: 'POST',
        body: {
          orgId: resolvedOrgId,
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
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest(`/api/users/invitations/${invitationId}/revoke`, {
        token,
        orgId: resolvedOrgId,
        method: 'POST',
        body: {
          orgId: resolvedOrgId,
        },
      });

      setInfo('Invitation revoked.');
      await loadData();
    } catch (revokeError: any) {
      setError(revokeError?.message || 'Failed to revoke invitation');
    }
  };

  return (
    <PageContainer title="Team & Roles" description="Team and role management">
      <Breadcrumb title="Team & Roles" items={BCrumb} />
      <BlankCard>
        <Stack spacing={3} p={3}>
          <Box
            sx={{
              ...sectionCardSx,
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(14, 165, 233, 0.08) 100%)',
            }}
          >
            <Stack
              direction={{ xs: 'column', lg: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ lg: 'center' }}
            >
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Team Workspace
                </Typography>
                <Typography variant="body1" color="text.secondary" mt={1}>
                  Manage reusable teams, membership access, and invitation-driven onboarding from one place.
                </Typography>
                {resolvedOrgName ? (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    Managing <strong>{resolvedOrgName}</strong>.
                  </Typography>
                ) : null}
              </Box>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <Box sx={{ ...sectionCardSx, minWidth: 150, p: 2.25 }}>
                  <Typography variant="overline" color="text.secondary">
                    Teams
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {teams.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Reusable groups
                  </Typography>
                </Box>
                <Box sx={{ ...sectionCardSx, minWidth: 150, p: 2.25 }}>
                  <Typography variant="overline" color="text.secondary">
                    Active Members
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {activeMembers.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In current org
                  </Typography>
                </Box>
                <Box sx={{ ...sectionCardSx, minWidth: 150, p: 2.25 }}>
                  <Typography variant="overline" color="text.secondary">
                    Pending Invites
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {pendingInvitationCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Awaiting acceptance
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Box>

          {!resolvedOrgId ? (
            <Alert severity="warning">Select an organization context before managing teams and members.</Alert>
          ) : null}
          {!canManageRoles ? (
            <Alert severity="info">You can view teams and members, but only employer/admin can change them.</Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {info ? <Alert severity="success">{info}</Alert> : null}
          <Box sx={sectionCardSx}>
            <Stack spacing={2.5}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                spacing={2}
                alignItems={{ md: 'center' }}
              >
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Teams
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.75}>
                    Assign projects and tickets to reusable teams, then manage membership centrally.
                  </Typography>
                </Box>
                {canManageRoles ? (
                  <Button variant="contained" onClick={openCreateTeam} disabled={!resolvedOrgId}>
                    Create Team
                  </Button>
                ) : null}
              </Stack>

              {loading ? <Typography color="text.secondary">Loading team workspace...</Typography> : null}

              {!loading ? (
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeadCellSx}>Team</TableCell>
                        <TableCell sx={tableHeadCellSx}>Members</TableCell>
                        <TableCell sx={tableHeadCellSx}>Workload</TableCell>
                        <TableCell sx={tableHeadCellSx} align="right">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {teams.map((team) => (
                        <TableRow key={team.id} hover>
                          <TableCell sx={{ py: 2.25 }}>
                            <Stack spacing={1}>
                              <Stack direction="row" spacing={1.25} alignItems="center" useFlexGap>
                                <Box
                                  sx={{
                                    width: 14,
                                    height: 14,
                                    borderRadius: '50%',
                                    backgroundColor: team.color,
                                    border: '1px solid rgba(15, 23, 42, 0.18)',
                                    flexShrink: 0,
                                  }}
                                />
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {team.name}
                                </Typography>
                                <Chip
                                  size="small"
                                  label={team.color}
                                  sx={{
                                    backgroundColor: hexToRgba(team.color, 0.14),
                                    color: getReadableTextColor(team.color),
                                    border: `1px solid ${resolveUiColor(team.color)}`,
                                  }}
                                />
                              </Stack>
                              <Typography variant="body2" color="text.secondary">
                                {team.description || 'No description yet.'}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2.25 }}>
                            <Stack spacing={1}>
                              <Typography variant="body2" fontWeight={600}>
                                {team.memberCount} member{team.memberCount === 1 ? '' : 's'}
                              </Typography>
                              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {team.members.slice(0, 3).map((member) => (
                                  <Chip key={member.userId} size="small" label={member.fullName} />
                                ))}
                                {team.memberCount > 3 ? (
                                  <Chip size="small" variant="outlined" label={`+${team.memberCount - 3} more`} />
                                ) : null}
                                {team.memberCount === 0 ? (
                                  <Typography variant="body2" color="text.secondary">
                                    No members assigned.
                                  </Typography>
                                ) : null}
                              </Stack>
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2.25 }}>
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                              <Chip size="small" variant="outlined" label={`${team.projectCount} projects`} />
                              <Chip size="small" variant="outlined" label={`${team.ticketCount} tickets`} />
                            </Stack>
                          </TableCell>
                          <TableCell sx={{ py: 2.25 }} align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {canManageRoles ? (
                                <Button size="small" variant="outlined" onClick={() => openEditTeam(team)}>
                                  Edit
                                </Button>
                              ) : null}
                              {canManageRoles ? (
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => void deleteTeam(team.id)}
                                >
                                  Delete
                                </Button>
                              ) : null}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {teams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ py: 5 }}>
                            <Stack spacing={1} alignItems="flex-start">
                              <Typography variant="subtitle1" fontWeight={700}>
                                No teams created yet
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                Create teams to assign projects and tickets to groups instead of one user at a time.
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : null}
            </Stack>
          </Box>

          <Box sx={sectionCardSx}>
            <Stack spacing={2.5}>
              <Box>
                <Typography variant="h5" fontWeight={700}>
                  Members
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.75}>
                  Review org access, manage roles, and see each member’s team assignments.
                </Typography>
              </Box>

              {!loading ? (
                <TableContainer>
                  <Table size="medium">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={tableHeadCellSx}>Member</TableCell>
                        <TableCell sx={tableHeadCellSx}>Access</TableCell>
                        <TableCell sx={tableHeadCellSx}>Teams</TableCell>
                        <TableCell sx={tableHeadCellSx}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {members.map((member) => {
                        const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
                        const memberTeams = teamMembershipsByUserId[member.userId] || [];
                        return (
                          <TableRow key={`${member.userId}-${member.orgId}`} hover>
                            <TableCell sx={{ py: 2.25 }}>
                              <Stack spacing={0.5}>
                                <Typography variant="subtitle1" fontWeight={700}>
                                  {fullName || 'Unnamed user'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {member.email}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ py: 2.25 }}>
                              <Stack spacing={1.25}>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {member.globalRole ? <Chip size="small" label={member.globalRole} /> : null}
                                  {!member.globalRole ? (
                                    <Typography variant="body2" color="text.secondary">
                                      No global role
                                    </Typography>
                                  ) : null}
                                </Stack>
                                {canManageRoles ? (
                                  <FormControl size="small" sx={{ minWidth: 180 }}>
                                    <InputLabel id={`role-label-${member.userId}`}>Org Role</InputLabel>
                                    <Select
                                      id={`org-role-select-${member.userId}`}
                                      name={`orgRole-${member.userId}`}
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
                                  <Chip size="small" variant="outlined" label={member.orgRole} />
                                )}
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ py: 2.25 }}>
                              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                {memberTeams.map((team) => (
                                  <Chip
                                    key={team.id}
                                    size="small"
                                    label={team.name}
                                    sx={{
                                      backgroundColor: hexToRgba(team.color, 0.12),
                                      color: getReadableTextColor(team.color),
                                      border: `1px solid ${resolveUiColor(team.color)}`,
                                    }}
                                  />
                                ))}
                                {!memberTeams.length ? (
                                  <Typography variant="body2" color="text.secondary">
                                    Not assigned to a team
                                  </Typography>
                                ) : null}
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ py: 2.25 }}>
                              {canManageRoles ? (
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Switch
                                    size="small"
                                    name={`member-status-${member.userId}`}
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
            </Stack>
          </Box>

          {canManageRoles ? (
            <Box sx={sectionCardSx}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    Invitations
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.75}>
                    New CRM memberships are created only through invitations.
                  </Typography>
                </Box>

                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ md: 'flex-end' }}
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'grey.50',
                  }}
                >
                  <TextField
                    id="invite-email"
                    name="inviteEmail"
                    label="Invite Email"
                    type="email"
                    value={inviteEmail}
                    onChange={(event) => setInviteEmail(event.target.value)}
                    fullWidth
                  />
                  <FormControl sx={{ minWidth: 190 }}>
                    <InputLabel id="invite-role-label">Role</InputLabel>
                    <Select
                      id="invite-role"
                      name="inviteRole"
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
                  <Button variant="contained" onClick={sendInvitation} disabled={inviting || !inviteEmail.trim()}>
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </Button>
                </Stack>

                {!loading ? (
                  <TableContainer>
                    <Table size="medium">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={tableHeadCellSx}>Email</TableCell>
                          <TableCell sx={tableHeadCellSx}>Role</TableCell>
                          <TableCell sx={tableHeadCellSx}>Status</TableCell>
                          <TableCell sx={tableHeadCellSx}>Expires</TableCell>
                          <TableCell sx={tableHeadCellSx}>Invited By</TableCell>
                          <TableCell sx={tableHeadCellSx}>Accepted User</TableCell>
                          <TableCell sx={tableHeadCellSx} align="right">
                            Actions
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {invitations.map((invitation) => (
                          <TableRow key={invitation.id} hover>
                            <TableCell sx={{ py: 2.25 }}>{invitation.email}</TableCell>
                            <TableCell sx={{ py: 2.25 }}>
                              <Chip size="small" label={invitation.role} />
                            </TableCell>
                            <TableCell sx={{ py: 2.25 }}>
                              <Chip size="small" color={statusChipColor(invitation.status)} label={invitation.status} />
                            </TableCell>
                            <TableCell sx={{ py: 2.25 }}>{formatDate(invitation.expiresAt)}</TableCell>
                            <TableCell sx={{ py: 2.25 }}>{invitation.invitedByEmail || '-'}</TableCell>
                            <TableCell sx={{ py: 2.25 }}>{invitation.invitedUserEmail || '-'}</TableCell>
                            <TableCell sx={{ py: 2.25 }} align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                {invitation.status === 'pending' || invitation.status === 'expired' ? (
                                  <Button size="small" variant="outlined" onClick={() => resendInvitation(invitation.id)}>
                                    Resend
                                  </Button>
                                ) : null}
                                {invitation.status === 'pending' || invitation.status === 'expired' ? (
                                  <Button
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                    onClick={() => revokeInvitation(invitation.id)}
                                  >
                                    Revoke
                                  </Button>
                                ) : null}
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                        {invitations.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} sx={{ py: 5 }}>
                              <Typography variant="body2" color="text.secondary">
                                No invitations yet.
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : null}
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </BlankCard>
      <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingTeamId ? 'Edit Team' : 'Create Team'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <TextField
              id="team-name"
              name="teamName"
              label="Team Name"
              value={teamForm.name}
              onChange={(event) => setTeamForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <TextField
              id="team-description"
              name="teamDescription"
              label="Description"
              value={teamForm.description}
              onChange={(event) => setTeamForm((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={2}
            />
            <Stack
              spacing={1.5}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'grey.50',
              }}
            >
              <Typography variant="subtitle2">Team Color</Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {PROJECT_TYPE_COLOR_PRESETS.map((preset) => {
                  const isSelected = resolvedColor === preset.color;
                  return (
                    <Button
                      key={preset.color}
                      variant={isSelected ? 'contained' : 'outlined'}
                      color="inherit"
                      onClick={() => setTeamForm((prev) => ({ ...prev, color: preset.color }))}
                      sx={{
                        justifyContent: 'flex-start',
                        minWidth: 0,
                        px: 1.25,
                        py: 0.9,
                        borderColor: isSelected ? preset.color : 'divider',
                        backgroundColor: isSelected ? hexToRgba(preset.color, 0.14) : 'transparent',
                        color: 'text.primary',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 14,
                            height: 14,
                            borderRadius: '50%',
                            backgroundColor: preset.color,
                            border: '1px solid rgba(15, 23, 42, 0.18)',
                          }}
                        />
                        <Typography variant="body2">{preset.label}</Typography>
                      </Stack>
                    </Button>
                  );
                })}
              </Stack>
              <TextField
                id="team-color"
                name="teamColor"
                label="Hex Color"
                value={teamForm.color}
                onChange={(event) =>
                  setTeamForm((prev) => ({ ...prev, color: normalizeColorInput(event.target.value) }))
                }
                helperText={
                  isValidColor ? 'Used for team chips and assignment labels.' : 'Enter a 6-digit hex color like #2563eb.'
                }
                error={Boolean(teamForm.color) && !isValidColor}
              />
              <Chip
                label={teamForm.name.trim() || 'Team Preview'}
                sx={{
                  width: 'fit-content',
                  backgroundColor: resolvedColor,
                  color: getReadableTextColor(resolvedColor),
                  fontWeight: 600,
                }}
              />
            </Stack>

            <Divider />

            <Stack spacing={1.25}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Team Members
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Search and add as many active members as needed. Editing a team keeps existing members selected.
                </Typography>
              </Box>
              <Autocomplete
                multiple
                disableCloseOnSelect
                filterSelectedOptions
                options={selectableTeamMembers}
                value={selectedTeamMembers}
                onChange={(_, nextValue) =>
                  setTeamForm((prev) => ({
                    ...prev,
                    memberUserIds: nextValue.map((member) => member.userId),
                  }))
                }
                getOptionLabel={(option) => `${getMemberName(option)} (${option.email})`}
                isOptionEqualToValue={(option, value) => option.userId === value.userId}
                noOptionsText="No active members available"
                renderTags={(value, getTagProps) =>
                  value.map((member, index) => (
                    <Chip {...getTagProps({ index })} key={member.userId} label={getMemberName(member)} size="small" />
                  ))
                }
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.userId}>
                    <Stack spacing={0.25}>
                      <Typography variant="body2" fontWeight={600}>
                        {getMemberName(option)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email} · {option.orgRole}
                      </Typography>
                    </Stack>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    id="team-members"
                    name="teamMembers"
                    label="Add Team Members"
                    placeholder={selectedTeamMembers.length ? '' : 'Search by name or email'}
                    helperText={
                      selectedTeamMembers.length
                        ? `${selectedTeamMembers.length} member${selectedTeamMembers.length === 1 ? '' : 's'} selected`
                        : 'Use this field to add multiple members quickly.'
                    }
                  />
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void saveTeam()}
            disabled={savingTeam || !teamForm.name.trim() || !isValidColor}
          >
            {savingTeam ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default TeamMembers;
