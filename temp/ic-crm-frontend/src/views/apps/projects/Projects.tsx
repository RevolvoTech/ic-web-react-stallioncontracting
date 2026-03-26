import React from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
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
import { isAbortError } from 'src/lib/fetchWithTimeout';
import { getReadableTextColor, hexToRgba, resolveUiColor } from 'src/lib/projectTypeColors';
import { ProjectTypeOption } from 'src/types/projectTypes';

type Member = {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  orgId: string;
};

type ProjectMember = {
  userId: string;
  memberRole: 'owner' | 'member';
  email: string;
  fullName: string;
};

type ProjectTeam = {
  id: string;
  name: string;
  description: string;
  color: string;
};

type ProjectItem = {
  id: string;
  name: string;
  code: string;
  description: string;
  status: 'planned' | 'active' | 'on_hold' | 'completed' | 'archived';
  priority: 'low' | 'medium' | 'high';
  startDate: string | null;
  dueDate: string | null;
  ownerUserId: string | null;
  ownerName: string | null;
  currentUserMemberRole: 'owner' | 'member' | null;
  projectType: ProjectTypeOption | null;
  members: ProjectMember[];
  memberCount: number;
  teams: ProjectTeam[];
  teamCount: number;
};

type TeamItem = {
  id: string;
  name: string;
  description: string;
  color: string;
};

type ProjectForm = {
  name: string;
  code: string;
  description: string;
  status: ProjectItem['status'];
  priority: ProjectItem['priority'];
  startDate: string;
  dueDate: string;
  ownerUserId: string;
  projectTypeId: string;
  teamIds: string[];
};

const emptyForm: ProjectForm = {
  name: '',
  code: '',
  description: '',
  status: 'planned',
  priority: 'medium',
  startDate: '',
  dueDate: '',
  ownerUserId: '',
  projectTypeId: '',
  teamIds: [],
};

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Projects',
  },
];

const TypeChip = ({ projectType }: { projectType: ProjectTypeOption | null }) => {
  if (!projectType) {
    return (
      <Typography variant="body2" color="textSecondary">
        Unassigned
      </Typography>
    );
  }

  return (
    <Chip
      size="small"
      label={projectType.name}
      sx={{
        width: 'fit-content',
        backgroundColor: hexToRgba(projectType.color, 0.16),
        color: getReadableTextColor(projectType.color),
        border: `1px solid ${resolveUiColor(projectType.color)}`,
      }}
    />
  );
};

const Projects = () => {
  const navigate = useNavigate();
  const { activeOrgId, getAccessToken, profile, setActiveOrgId } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [projectTypes, setProjectTypes] = React.useState<ProjectTypeOption[]>([]);
  const [teams, setTeams] = React.useState<TeamItem[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [membersLoaded, setMembersLoaded] = React.useState(false);
  const [membersLoading, setMembersLoading] = React.useState(false);

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = React.useState(false);

  const [membersOpen, setMembersOpen] = React.useState(false);
  const [membersDialogLoading, setMembersDialogLoading] = React.useState(false);
  const [membersProject, setMembersProject] = React.useState<ProjectItem | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [selectedTeamIds, setSelectedTeamIds] = React.useState<string[]>([]);
  const [membersOwnerId, setMembersOwnerId] = React.useState('');
  const [savingMembers, setSavingMembers] = React.useState(false);

  const currentUserId = profile?.user.id || null;
  const fallbackOrgId =
    activeOrgId || profile?.activeOrg.orgId || profile?.user.defaultOrgId || profile?.memberships?.[0]?.org_id || null;
  const resolvedOrgId = activeOrgId || fallbackOrgId;
  const currentOrgRole =
    profile?.activeOrg.orgRole ||
    profile?.memberships?.find((membership) => membership.org_id === resolvedOrgId)?.role ||
    null;
  const isGlobalAdmin = profile?.user.globalRole === 'admin';
  const isOrgProjectManager = Boolean(isGlobalAdmin || currentOrgRole === 'employer');
  const canCreateProject = isOrgProjectManager;

  React.useEffect(() => {
    if (!activeOrgId && resolvedOrgId) {
      void setActiveOrgId(resolvedOrgId);
    }
  }, [activeOrgId, resolvedOrgId, setActiveOrgId]);

  const isProjectOwner = (project: ProjectItem) =>
    Boolean(currentUserId) &&
    (String(project.ownerUserId || '') === String(currentUserId) ||
      project.currentUserMemberRole === 'owner');

  const canManageProject = (project: ProjectItem) => {
    if (isOrgProjectManager) {
      return true;
    }
    return currentOrgRole === 'employee' && isProjectOwner(project);
  };

  const editingProject = projects.find((project) => project.id === editingProjectId) || null;
  const canSaveProjectForm =
    formMode === 'create' ? canCreateProject : Boolean(editingProject && canManageProject(editingProject));
  const canManageMembersProject = Boolean(membersProject && canManageProject(membersProject));
  const showMissingProjectTypesWarning = !loading && !error && projectTypes.length === 0;

  const resolveMemberName = (member: Member) =>
    `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;

  const loadData = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      if (!resolvedOrgId) {
        setProjects([]);
        setProjectTypes([]);
        setTeams([]);
        return;
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const [projectsData, projectTypesData, teamsData] = await Promise.all([
        crmRequest('/api/projects', { token, orgId: resolvedOrgId, signal }),
        crmRequest('/api/project-types', { token, signal }),
        crmRequest('/api/teams', { token, orgId: resolvedOrgId, signal }),
      ]);

      setProjects(Array.isArray(projectsData) ? (projectsData as ProjectItem[]) : []);
      setProjectTypes(Array.isArray(projectTypesData) ? (projectTypesData as ProjectTypeOption[]) : []);
      setTeams(Array.isArray(teamsData) ? (teamsData as TeamItem[]) : []);
    } catch (loadError: any) {
      if (isAbortError(loadError)) {
        return;
      }
      setError(loadError?.message || 'Failed to load projects workspace');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [getAccessToken, resolvedOrgId]);

  React.useEffect(() => {
    const controller = new AbortController();

    loadData(controller.signal).catch(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadData]);

  React.useEffect(() => {
    setMembers([]);
    setMembersLoaded(false);
  }, [resolvedOrgId]);

  const ensureMembersLoaded = React.useCallback(async () => {
    if (membersLoaded) {
      return members;
    }

    setMembersLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const membersPath = resolvedOrgId
        ? `/api/users/members?orgId=${encodeURIComponent(resolvedOrgId)}`
        : '/api/users/members';

      const data = await crmRequest(membersPath, {
        token,
        orgId: resolvedOrgId,
      });

      const nextMembers = Array.isArray(data) ? (data as Member[]) : [];
      setMembers(nextMembers);
      setMembersLoaded(true);
      return nextMembers;
    } finally {
      setMembersLoading(false);
    }
  }, [getAccessToken, members, membersLoaded, resolvedOrgId]);

  const loadProjectAssignments = React.useCallback(async (projectId: string) => {
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Missing session token');
    }

    const data = await crmRequest(`/api/projects/${projectId}`, {
      token,
      orgId: resolvedOrgId,
    });

    return data as ProjectItem;
  }, [getAccessToken, resolvedOrgId]);

  const openCreate = async () => {
    if (!canCreateProject) {
      return;
    }

    try {
      setError('');
      if (!resolvedOrgId) {
        setError('Select an organization before creating a project.');
        return;
      }
      if (!projectTypes.length) {
        setError('Create at least one project type before creating projects.');
        return;
      }

      await ensureMembersLoaded();
      setFormMode('create');
      setEditingProjectId(null);
      setForm(emptyForm);
      setFormOpen(true);
    } catch (openError: any) {
      setError(openError?.message || 'Failed to open project form');
    }
  };

  const openEdit = async (project: ProjectItem) => {
    if (!canManageProject(project)) {
      return;
    }

    try {
      await ensureMembersLoaded();
      setFormMode('edit');
      setEditingProjectId(project.id);
      setForm({
        name: project.name || '',
        code: project.code || '',
        description: project.description || '',
        status: project.status || 'planned',
        priority: project.priority || 'medium',
        startDate: project.startDate || '',
        dueDate: project.dueDate || '',
        ownerUserId: project.ownerUserId || '',
        projectTypeId: project.projectType?.id || '',
        teamIds: project.teams.map((team) => team.id),
      });
      setFormOpen(true);
    } catch (openError: any) {
      setError(openError?.message || 'Failed to open project form');
    }
  };

  const saveProject = async () => {
    setError('');
    setInfo('');
    setSaving(true);

    try {
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      if (formMode === 'create' && !canCreateProject) {
        throw new Error('Only employers and admins can create projects');
      }

      if (!form.projectTypeId) {
        throw new Error('Project type is required');
      }

      if (formMode === 'edit' && (!editingProject || !canManageProject(editingProject))) {
        throw new Error('You are not allowed to update this project');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const body = {
        orgId: resolvedOrgId,
        ...form,
        ownerUserId: form.ownerUserId || null,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
        projectTypeId: form.projectTypeId,
        teamIds: form.teamIds,
      };

      if (formMode === 'create') {
        await crmRequest('/api/projects', {
          token,
          orgId: resolvedOrgId,
          method: 'POST',
          body,
        });
        setInfo('Project created.');
      } else if (editingProjectId) {
        await crmRequest(`/api/projects/${editingProjectId}`, {
          token,
          orgId: resolvedOrgId,
          method: 'PATCH',
          body,
        });
        setInfo('Project updated.');
      }

      setFormOpen(false);
      await loadData();
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const deleteProject = async (projectId: string) => {
    setError('');
    setInfo('');
    try {
      const project = projects.find((item) => item.id === projectId);
      if (!project || !canManageProject(project)) {
        throw new Error('You are not allowed to delete this project');
      }
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest(`/api/projects/${projectId}`, {
        token,
        orgId: resolvedOrgId,
        method: 'DELETE',
        body: {
          orgId: resolvedOrgId,
        },
      });

      setInfo('Project deleted.');
      await loadData();
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete project');
    }
  };

  const openMembersDialog = async (project: ProjectItem) => {
    if (!canManageProject(project)) {
      return;
    }

    setError('');
    setMembersDialogLoading(true);
    try {
      await ensureMembersLoaded();
      const projectDetail = await loadProjectAssignments(project.id);
      setMembersProject(projectDetail);
      setSelectedMemberIds(projectDetail.members.map((member) => member.userId));
      setSelectedTeamIds(projectDetail.teams.map((team) => team.id));
      setMembersOwnerId(projectDetail.ownerUserId || '');
      setMembersOpen(true);
    } catch (dialogError: any) {
      setError(dialogError?.message || 'Failed to load project assignments');
    } finally {
      setMembersDialogLoading(false);
    }
  };

  const saveMembers = async () => {
    if (!membersProject) {
      return;
    }

    setError('');
    setInfo('');
    setSavingMembers(true);

    try {
      if (!canManageMembersProject) {
        throw new Error('You are not allowed to manage this project');
      }
      if (!resolvedOrgId) {
        throw new Error('Organization context is required');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const finalIds = new Set(selectedMemberIds);
      if (membersOwnerId) {
        finalIds.add(membersOwnerId);
      }

      await crmRequest(`/api/projects/${membersProject.id}`, {
        token,
        orgId: resolvedOrgId,
        method: 'PATCH',
        body: {
          orgId: resolvedOrgId,
          ownerUserId: membersOwnerId || null,
          ...(membersProject.projectType?.id ? { projectTypeId: membersProject.projectType.id } : {}),
          teamIds: selectedTeamIds,
        },
      });

      const existingRolesByUserId = new Map(
        membersProject.members.map((member) => [member.userId, member.memberRole]),
      );

      await Promise.all([
        ...Array.from(finalIds)
          .filter((userId) => {
            const nextRole = membersOwnerId && userId === membersOwnerId ? 'owner' : 'member';
            return existingRolesByUserId.get(userId) !== nextRole;
          })
          .map((userId) =>
            crmRequest(`/api/projects/${membersProject.id}/members`, {
              token,
              orgId: resolvedOrgId,
              method: 'POST',
              body: {
                orgId: resolvedOrgId,
                userId,
                memberRole: membersOwnerId && userId === membersOwnerId ? 'owner' : 'member',
              },
            }),
          ),
        ...membersProject.members
          .filter((existing) => !finalIds.has(existing.userId))
          .map((existing) =>
            crmRequest(`/api/projects/${membersProject.id}/members/${existing.userId}`, {
              token,
              orgId: resolvedOrgId,
              method: 'DELETE',
              body: {
                orgId: resolvedOrgId,
              },
            }),
          ),
      ]);

      setMembersOpen(false);
      setInfo('Project assignments updated.');
      await loadData();
    } catch (saveMembersError: any) {
      setError(saveMembersError?.message || 'Failed to update project assignments');
    } finally {
      setSavingMembers(false);
    }
  };

  return (
    <PageContainer title="Projects App" description="Manage projects and assignments">
      <Breadcrumb title="Projects App" items={BCrumb} />
      <BlankCard>
        <Stack spacing={2} p={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ sm: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography variant="h5">Projects</Typography>
              <Typography variant="body2" color="textSecondary">
                Global project types drive project labeling and calendar colors across the CRM.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              {isGlobalAdmin ? (
                <Button variant="outlined" onClick={() => navigate('/apps/project-types')}>
                  Project Types
                </Button>
              ) : null}
              {canCreateProject ? (
                <Button variant="contained" onClick={() => void openCreate()}>
                  Create Project
                </Button>
              ) : null}
            </Stack>
          </Stack>

          {!resolvedOrgId && !loading ? (
            <Alert severity="warning">Select an organization context before managing projects and team assignments.</Alert>
          ) : null}
          {showMissingProjectTypesWarning ? (
            <Alert severity="warning">
              No project types are currently available. A global admin can add one from Project Types. If you expected defaults, check backend migration health.
            </Alert>
          ) : null}
          {!canCreateProject ? (
            <Alert severity="info">
              Only employers and admins can create projects. Project owners can still manage their assigned projects.
            </Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {info ? <Alert severity="success">{info}</Alert> : null}
          {loading ? <Typography>Loading projects...</Typography> : null}

          {!loading ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Members</TableCell>
                    <TableCell>Teams</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projects.map((project) => {
                    const canManage = canManageProject(project);
                    return (
                      <TableRow key={project.id}>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="subtitle2">{project.name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {project.code || '-'}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <TypeChip projectType={project.projectType} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" label={project.status} />
                        </TableCell>
                        <TableCell>
                          <Chip size="small" variant="outlined" label={project.priority} />
                        </TableCell>
                        <TableCell>{project.ownerName || '-'}</TableCell>
                        <TableCell>{project.memberCount}</TableCell>
                        <TableCell>{project.teamCount}</TableCell>
                        <TableCell>{project.dueDate || '-'}</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => navigate(`/apps/projects/${project.id}`)}
                            >
                              View
                            </Button>
                            {canManage ? (
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => void openMembersDialog(project)}
                                disabled={membersDialogLoading}
                              >
                                Assignments
                              </Button>
                            ) : null}
                            {canManage ? (
                              <Button size="small" variant="outlined" onClick={() => void openEdit(project)}>
                                Edit
                              </Button>
                            ) : null}
                            {canManage ? (
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() => void deleteProject(project.id)}
                              >
                                Delete
                              </Button>
                            ) : null}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9}>
                        <Typography variant="body2" color="textSecondary">
                          No projects yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </TableContainer>
          ) : null}
        </Stack>
      </BlankCard>

      <Dialog open={formOpen} onClose={() => setFormOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{formMode === 'create' ? 'Create Project' : 'Edit Project'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Project Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <TextField
              label="Project Code"
              value={form.code}
              onChange={(event) => setForm((prev) => ({ ...prev, code: event.target.value }))}
            />
            <TextField
              label="Description"
              multiline
              minRows={3}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            <FormControl fullWidth required>
              <InputLabel id="project-type-label">Project Type</InputLabel>
              <Select
                labelId="project-type-label"
                label="Project Type"
                value={form.projectTypeId}
                onChange={(event) => setForm((prev) => ({ ...prev, projectTypeId: String(event.target.value) }))}
              >
                {projectTypes.map((projectType) => (
                  <MenuItem key={projectType.id} value={projectType.id}>
                    {projectType.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="project-status-label">Status</InputLabel>
                <Select
                  labelId="project-status-label"
                  label="Status"
                  value={form.status}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, status: event.target.value as ProjectItem['status'] }))
                  }
                >
                  <MenuItem value="planned">planned</MenuItem>
                  <MenuItem value="active">active</MenuItem>
                  <MenuItem value="on_hold">on_hold</MenuItem>
                  <MenuItem value="completed">completed</MenuItem>
                  <MenuItem value="archived">archived</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="project-priority-label">Priority</InputLabel>
                <Select
                  labelId="project-priority-label"
                  label="Priority"
                  value={form.priority}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, priority: event.target.value as ProjectItem['priority'] }))
                  }
                >
                  <MenuItem value="low">low</MenuItem>
                  <MenuItem value="medium">medium</MenuItem>
                  <MenuItem value="high">high</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={(event) => setForm((prev) => ({ ...prev, startDate: event.target.value }))}
              />
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={form.dueDate}
                onChange={(event) => setForm((prev) => ({ ...prev, dueDate: event.target.value }))}
              />
            </Stack>
            <FormControl fullWidth disabled={membersLoading}>
              <InputLabel id="project-owner-label">Owner</InputLabel>
              <Select
                labelId="project-owner-label"
                label="Owner"
                value={form.ownerUserId}
                onChange={(event) => setForm((prev) => ({ ...prev, ownerUserId: String(event.target.value) }))}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.userId} value={member.userId}>
                    {resolveMemberName(member)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel id="project-teams-label">Assigned Teams</InputLabel>
              <Select
                labelId="project-teams-label"
                label="Assigned Teams"
                multiple
                value={form.teamIds}
                onChange={(event) => setForm((prev) => ({ ...prev, teamIds: event.target.value as string[] }))}
                renderValue={(selected) =>
                  (selected as string[])
                    .map((teamId) => teams.find((team) => team.id === teamId)?.name || teamId)
                    .join(', ')
                }
              >
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void saveProject()}
            disabled={saving || !form.name.trim() || !form.projectTypeId || !canSaveProjectForm}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Project Assignments</DialogTitle>
        <DialogContent>
          {membersDialogLoading ? (
            <Typography mt={1}>Loading project assignments...</Typography>
          ) : (
            <Stack spacing={2} mt={1}>
              <FormControl fullWidth>
                <InputLabel id="members-owner-label">Project Owner</InputLabel>
                <Select
                  labelId="members-owner-label"
                  label="Project Owner"
                  value={membersOwnerId}
                  disabled={!canManageMembersProject}
                  onChange={(event) => setMembersOwnerId(String(event.target.value))}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {resolveMemberName(member)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="teams-select-label">Assigned Teams</InputLabel>
                <Select
                  labelId="teams-select-label"
                  label="Assigned Teams"
                  multiple
                  value={selectedTeamIds}
                  disabled={!canManageMembersProject}
                  onChange={(event) => setSelectedTeamIds(event.target.value as string[])}
                  renderValue={(selected) =>
                    (selected as string[])
                      .map((teamId) => teams.find((team) => team.id === teamId)?.name || teamId)
                      .join(', ')
                  }
                >
                  {teams.map((team) => (
                    <MenuItem key={team.id} value={team.id}>
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="members-select-label">Assigned Members</InputLabel>
                <Select
                  labelId="members-select-label"
                  label="Assigned Members"
                  multiple
                  value={selectedMemberIds}
                  disabled={!canManageMembersProject}
                  onChange={(event) => setSelectedMemberIds(event.target.value as string[])}
                  renderValue={(selected) =>
                    (selected as string[])
                      .map((userId) => {
                        const member = members.find((item) => item.userId === userId);
                        return member ? resolveMemberName(member) : userId;
                      })
                      .join(', ')
                  }
                >
                  {members.map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {resolveMemberName(member)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembersOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void saveMembers()}
            disabled={savingMembers || membersDialogLoading || !canManageMembersProject}
          >
            {savingMembers ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Projects;
