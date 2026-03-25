import React from 'react';
import { useNavigate } from 'react-router';
import {
  Alert,
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
  members: ProjectMember[];
  memberCount: number;
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

const Projects = () => {
  const navigate = useNavigate();
  const { activeOrgId, getAccessToken, profile } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [projects, setProjects] = React.useState<ProjectItem[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);

  const [formOpen, setFormOpen] = React.useState(false);
  const [formMode, setFormMode] = React.useState<'create' | 'edit'>('create');
  const [editingProjectId, setEditingProjectId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<ProjectForm>(emptyForm);
  const [saving, setSaving] = React.useState(false);

  const [membersOpen, setMembersOpen] = React.useState(false);
  const [membersProject, setMembersProject] = React.useState<ProjectItem | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = React.useState<string[]>([]);
  const [membersOwnerId, setMembersOwnerId] = React.useState('');
  const [savingMembers, setSavingMembers] = React.useState(false);

  const currentUserId = profile?.user.id || null;
  const currentOrgRole = profile?.activeOrg.orgRole || null;
  const isOrgProjectManager = Boolean(profile?.user.globalRole === 'admin' || currentOrgRole === 'employer');
  const canCreateProject = isOrgProjectManager;

  const isProjectOwner = (project: ProjectItem) =>
    Boolean(currentUserId) &&
    (String(project.ownerUserId || '') === String(currentUserId) ||
      project.members.some(
        (member) => String(member.userId) === String(currentUserId) && member.memberRole === 'owner',
      ));

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

  const resolveMemberName = (member: Member) =>
    `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;

  const loadData = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const [projectsData, membersData] = await Promise.all([
        crmRequest('/api/projects', { token, orgId: activeOrgId, signal }),
        crmRequest(
          activeOrgId ? `/api/users/members?orgId=${encodeURIComponent(activeOrgId)}` : '/api/users/members',
          { token, orgId: activeOrgId, signal },
        ),
      ]);

      setProjects(Array.isArray(projectsData) ? projectsData : []);
      setMembers(Array.isArray(membersData) ? membersData : []);
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
  }, [activeOrgId, getAccessToken]);

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

  const openCreate = () => {
    if (!canCreateProject) {
      return;
    }
    setFormMode('create');
    setEditingProjectId(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (project: ProjectItem) => {
    if (!canManageProject(project)) {
      return;
    }
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
    });
    setFormOpen(true);
  };

  const saveProject = async () => {
    setError('');
    setInfo('');
    setSaving(true);

    try {
      if (formMode === 'create' && !canCreateProject) {
        throw new Error('Only employers and admins can create projects');
      }

      if (formMode === 'edit' && (!editingProject || !canManageProject(editingProject))) {
        throw new Error('You are not allowed to update this project');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const body = {
        orgId: activeOrgId,
        ...form,
        ownerUserId: form.ownerUserId || null,
        startDate: form.startDate || null,
        dueDate: form.dueDate || null,
      };

      if (formMode === 'create') {
        await crmRequest('/api/projects', {
          token,
          orgId: activeOrgId,
          method: 'POST',
          body,
        });
        setInfo('Project created.');
      } else if (editingProjectId) {
        await crmRequest(`/api/projects/${editingProjectId}`, {
          token,
          orgId: activeOrgId,
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

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      await crmRequest(`/api/projects/${projectId}`, {
        token,
        orgId: activeOrgId,
        method: 'DELETE',
        body: {
          orgId: activeOrgId,
        },
      });

      setInfo('Project deleted.');
      await loadData();
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete project');
    }
  };

  const openMembersDialog = (project: ProjectItem) => {
    if (!canManageProject(project)) {
      return;
    }
    setMembersProject(project);
    const current = project.members.map((member) => member.userId);
    setSelectedMemberIds(current);
    setMembersOwnerId(project.ownerUserId || '');
    setMembersOpen(true);
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
        orgId: activeOrgId,
        method: 'PATCH',
        body: {
          orgId: activeOrgId,
          ownerUserId: membersOwnerId || null,
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
              orgId: activeOrgId,
              method: 'POST',
              body: {
                orgId: activeOrgId,
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
              orgId: activeOrgId,
              method: 'DELETE',
              body: {
                orgId: activeOrgId,
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
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
            <Typography variant="h5">Projects</Typography>
            {canCreateProject ? (
              <Button variant="contained" onClick={openCreate}>
                Create Project
              </Button>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Only employers and admins can create projects. Project owners can manage their own projects.
              </Typography>
            )}
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {info ? <Alert severity="success">{info}</Alert> : null}
          {loading ? <Typography>Loading projects...</Typography> : null}

          {!loading ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Owner</TableCell>
                    <TableCell>Members</TableCell>
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
                        <Chip size="small" label={project.status} />
                      </TableCell>
                      <TableCell>
                        <Chip size="small" variant="outlined" label={project.priority} />
                      </TableCell>
                      <TableCell>{project.ownerName || '-'}</TableCell>
                      <TableCell>{project.memberCount}</TableCell>
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
                            <Button size="small" variant="outlined" onClick={() => openMembersDialog(project)}>
                              Members
                            </Button>
                          ) : null}
                          {canManage ? (
                            <Button size="small" variant="outlined" onClick={() => openEdit(project)}>
                              Edit
                            </Button>
                          ) : null}
                          {canManage ? (
                            <Button size="small" color="error" variant="outlined" onClick={() => deleteProject(project.id)}>
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
                      <TableCell colSpan={7}>
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
            <FormControl fullWidth>
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
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveProject} disabled={saving || !form.name.trim() || !canSaveProjectForm}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={membersOpen} onClose={() => setMembersOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Project Members</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembersOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveMembers} disabled={savingMembers || !canManageMembersProject}>
            {savingMembers ? 'Saving...' : 'Save Assignments'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default Projects;
