import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormLabel,
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
import {
  getReadableTextColor,
  hexToRgba,
  isHexColor,
  PROJECT_TYPE_COLOR_PRESETS,
  resolveUiColor,
} from 'src/lib/projectTypeColors';
import { HexColorPicker } from 'react-colorful';
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

const normalizeColorInput = (value: string) => {
  const normalized = String(value || '')
    .trim()
    .replace(/^#/, '')
    .replace(/[^0-9a-f]/gi, '')
    .slice(0, 6)
    .toLowerCase();

  return normalized ? `#${normalized}` : '';
};

const ProjectTypes = () => {
  const { profile, getAccessToken } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [projectTypes, setProjectTypes] = React.useState<ProjectTypeOption[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const resolvedColor = resolveUiColor(form.color || emptyForm.color);
  const isValidColor = isHexColor(form.color);

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
  }, [getAccessToken, isGlobalAdmin]);

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

  const updateFormColor = (nextColor: string) => {
    setForm((prev) => ({
      ...prev,
      color: nextColor,
    }));
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
        name: form.name.trim(),
        color: form.color,
      };

      const data = editingId
        ? await crmRequest(`/api/project-types/${editingId}`, {
            token,
            method: 'PATCH',
            body,
          })
        : await crmRequest('/api/project-types', {
            token,
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
        method: 'DELETE',
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
            Define the global labels and colors used by projects, calendars, and linked tasks.
          </Typography>

          {!isGlobalAdmin ? (
            <Alert severity="error">Only the global admin can manage project types.</Alert>
          ) : null}
          {error ? <Alert severity="error">{error}</Alert> : null}
          {info ? <Alert severity="success">{info}</Alert> : null}
          {!loading && isGlobalAdmin && !error && projectTypes.length === 0 ? (
            <Alert severity="warning">
              No global project types are currently available. You can add one now. If you expected the default 8 types, check backend startup migration health.
            </Alert>
          ) : null}

          {isGlobalAdmin ? (
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={openCreate}>
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
                              py: 0.45,
                              borderRadius: 999,
                              backgroundColor: resolveUiColor(projectType.color),
                              color: getReadableTextColor(projectType.color),
                              fontWeight: 700,
                            }}
                          >
                            {projectType.name}
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
                          No global project types are currently available.
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

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
            },
          },
        }}
      >
        <DialogTitle>{editingId ? 'Edit Project Type' : 'Add Project Type'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <TextField
              id="project-type-name"
              name="projectTypeName"
              label="Type Name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              placeholder="Electrical, Plumbing, Framing..."
              required
            />
            <Stack
              spacing={1.75}
              sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: 'grey.50',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                <Box>
                  <FormLabel id="project-type-color-label">Color</FormLabel>
                  <Typography variant="body2" color="textSecondary" mt={0.75}>
                    Pick a project color used across the CRM.
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1.25}
                  alignItems="center"
                  sx={{
                    px: 1.25,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    minWidth: 132,
                  }}
                >
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '50%',
                      backgroundColor: resolvedColor,
                      border: '1px solid rgba(15, 23, 42, 0.18)',
                      flexShrink: 0,
                    }}
                  />
                  <Box>
                    <Typography variant="caption" color="textSecondary" display="block" lineHeight={1.1}>
                      Selected
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {resolvedColor}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
              <Stack
                direction="row"
                flexWrap="wrap"
                gap={1}
                role="group"
                aria-labelledby="project-type-color-label"
              >
                {PROJECT_TYPE_COLOR_PRESETS.map((preset) => {
                  const isSelected = resolvedColor === preset.color;
                  return (
                    <Button
                      key={preset.color}
                      variant={isSelected ? 'contained' : 'outlined'}
                      color="inherit"
                      onClick={() => updateFormColor(preset.color)}
                      sx={{
                        justifyContent: 'flex-start',
                        minWidth: 0,
                        px: 1.25,
                        py: 0.9,
                        borderColor: isSelected ? preset.color : 'divider',
                        backgroundColor: isSelected ? hexToRgba(preset.color, 0.14) : 'transparent',
                        color: 'text.primary',
                        borderRadius: 2,
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
              <Divider flexItem />
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  backgroundColor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  '.react-colorful': {
                    width: '100%',
                    height: 220,
                  },
                  '.react-colorful__saturation': {
                    borderBottomWidth: '18px',
                    borderRadius: '16px 16px 0 0',
                  },
                  '.react-colorful__hue': {
                    height: 18,
                    borderRadius: '0 0 16px 16px',
                  },
                  '.react-colorful__pointer': {
                    width: 20,
                    height: 20,
                    borderWidth: '3px',
                    boxShadow: '0 10px 24px rgba(15, 23, 42, 0.18)',
                  },
                }}
              >
                <HexColorPicker color={resolvedColor} onChange={updateFormColor} />
              </Box>
              <TextField
                id="project-type-color"
                name="projectTypeColor"
                label="Hex Color"
                value={form.color}
                onChange={(event) => updateFormColor(normalizeColorInput(event.target.value))}
                placeholder="#f97316"
                helperText={
                  isValidColor
                    ? 'Used across projects, calendar, and kanban.'
                    : 'Enter a 6-digit hex color like #f97316.'
                }
                error={Boolean(form.color) && !isValidColor}
              />
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: `1px solid ${resolvedColor}`,
                  background: `linear-gradient(135deg, ${hexToRgba(resolvedColor, 0.18)} 0%, ${hexToRgba(resolvedColor, 0.08)} 100%)`,
                }}
              >
                <Stack spacing={1.25}>
                  <Typography variant="caption" color="textSecondary">
                    Preview
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={form.name.trim() || 'Project Type Preview'}
                      sx={{
                        width: 'fit-content',
                        backgroundColor: resolvedColor,
                        color: getReadableTextColor(resolvedColor),
                        fontWeight: 600,
                      }}
                    />
                    <Chip
                      variant="outlined"
                      label="Calendar Event"
                      sx={{
                        width: 'fit-content',
                        borderColor: resolvedColor,
                        color: resolvedColor,
                        backgroundColor: 'background.paper',
                      }}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => void saveProjectType()}
            disabled={saving || !form.name.trim() || !isValidColor}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
};

export default ProjectTypes;
