import React from 'react';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    to: '/apps/projects',
    title: 'Projects',
  },
  {
    title: 'Project Types',
  },
];

const emptyForm = {
  name: '',
  color: '#f97316',
};

const ProjectTypes = () => {
  const { profile, activeOrgId, getAccessToken } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [projectTypes, setProjectTypes] = React.useState<ProjectTypeOption[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);

  const isGlobalAdmin = profile?.user.globalRole === 'admin';

  const loadData = React.useCallback(async (signal?: AbortSignal) => {
    if (!isGlobalAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const data = await crmRequest('/api/project-types', {
        token,
        orgId: activeOrgId,
        signal,
      });

      setProjectTypes(Array.isArray(data) ? (data as ProjectTypeOption[]) : []);
    } catch (loadError: any) {
      if (isAbortError(loadError)) {
        return;
      }
      setError(loadError?.message || 'Failed to load project types');
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [activeOrgId, getAccessToken, isGlobalAdmin]);

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
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (projectType: ProjectTypeOption) => {
    setEditingId(projectType.id);
    setForm({
      name: projectType.name,
      color: projectType.color,
    });
    setDialogOpen(true);
  };

  const saveProjectType = async () => {
    setSaving(true);
    setError('');
    setInfo('');

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const body = {
        orgId: activeOrgId,
        name: form.name.trim(),
        color: form.color,
      };

      const data = editingId
        ? await crmRequest(`/api/project-types/${editingId}`, {
            token,
            orgId: activeOrgId,
            method: 'PATCH',
            body,
          })
        : await crmRequest('/api/project-types', {
            token,
            orgId: activeOrgId,
            method: 'POST',
            body,
          });

      setProjectTypes(Array.isArray(data) ? (data as ProjectTypeOption[]) : []);
      setInfo(editingId ? 'Project type updated.' : 'Project type created.');
      setDialogOpen(false);
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save project type');
    } finally {
      setSaving(false);
    }
  };

  const deleteProjectType = async (projectTypeId: string) => {
    setError('');
    setInfo('');
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const data = await crmRequest(`/api/project-types/${projectTypeId}`, {
        token,
        orgId: activeOrgId,
        method: 'DELETE',
        body: {
          orgId: activeOrgId,
        },
      });

      setProjectTypes(Array.isArray(data) ? (data as ProjectTypeOption[]) : []);
      setInfo('Project type deleted.');
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete project type');
    }
  };

  return (
    <PageContainer title="Project Types" description="Admin-managed project type settings">
      <Breadcrumb title="Project Types" items={BCrumb} />
      <BlankCard>
        <Stack spacing={2} p={3}>
          <Typography variant="h5">Project Types</Typography>
          <Typography variant="body2" color="textSecondary">
            Define the labels and colors used by projects, calendars, and linked tasks.
          </Typography>

          {!isGlobalAdmin ? (
            <Alert severity="error">Only the global admin can manage project types.</Alert>
          ) : null}
          {!activeOrgId && isGlobalAdmin ? (
            <Alert severity="warning">Select an organization context before managing project types.</Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {info ? <Alert severity="success">{info}</Alert> : null}

          {isGlobalAdmin ? (
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={openCreate} disabled={!activeOrgId}>
                Add Project Type
              </Button>
            </Stack>
          ) : null}

          {loading ? <Typography>Loading project types...</Typography> : null}

          {!loading && isGlobalAdmin ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Updated</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {projectTypes.map((projectType) => (
                    <TableRow key={projectType.id}>
                      <TableCell>{projectType.name}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              width: 18,
                              height: 18,
                              borderRadius: '50%',
                              backgroundColor: resolveUiColor(projectType.color),
                              border: '1px solid rgba(15, 23, 42, 0.18)',
                            }}
                          />
                          <Typography variant="body2">{projectType.color}</Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              px: 1,
                              py: 0.25,
                              borderRadius: 1,
                              backgroundColor: hexToRgba(projectType.color, 0.16),
                              color: getReadableTextColor(projectType.color),
                              border: `1px solid ${resolveUiColor(projectType.color)}`,
                            }}
                          >
                            Preview
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{projectType.updatedAt ? new Date(projectType.updatedAt).toLocaleString() : '-'}</TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button size="small" variant="outlined" onClick={() => openEdit(projectType)}>
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            onClick={() => void deleteProjectType(projectType.id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                  {projectTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="textSecondary">
                          No project types configured yet.
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

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>{editingId ? 'Edit Project Type' : 'Add Project Type'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Type Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <TextField
              label="Color"
              type="color"
              value={form.color}
              onChange={(event) => setForm((prev) => ({ ...prev, color: event.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => void saveProjectType()} disabled={saving || !form.name.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ProjectTypes;
