import React from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import BlankCard from 'src/components/shared/BlankCard';
import { crmRequest } from 'src/api/crm/client';
import { useAuth } from 'src/context/AuthContext';
import { isAbortError } from 'src/lib/fetchWithTimeout';
import { getReadableTextColor, hexToRgba, resolveUiColor } from 'src/lib/projectTypeColors';
import { ProjectTypeOption } from 'src/types/projectTypes';

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

type ProjectDetailData = {
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
  currentUserHasTeamAccess: boolean;
  projectType: ProjectTypeOption | null;
  members: ProjectMember[];
  memberCount: number;
  teams: ProjectTeam[];
  teamCount: number;
  createdAt: string;
  updatedAt: string;
  summary: {
    tickets: {
      total: number;
      open: number;
      pending: number;
      closed: number;
    };
    calendar: {
      total: number;
      upcoming: number;
      nextEventAt: string | null;
    };
    kanban: {
      total: number;
      done: number;
      inProgress: number;
    };
    completionPercent: number;
  };
  recent: {
    tickets: Array<{
      id: number;
      title: string;
      status: 'Open' | 'Pending' | 'Closed';
      createdAt: string;
    }>;
    events: Array<{
      id: number;
      title: string;
      startsAt: string;
      endsAt: string;
      color: string;
    }>;
    tasks: Array<{
      id: number;
      title: string;
      dueDate: string | null;
      taskProperty: string;
      listName: string | null;
    }>;
  };
};

type ProjectFile = {
  id: string;
  projectId: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedByName: string | null;
  createdAt: string;
  url: string | null;
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return parsed.toLocaleString();
};

const formatBytes = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }

  return `${size.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

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
    title: 'Project Detail',
  },
];

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { activeOrgId, getAccessToken, profile, setActiveOrgId } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [project, setProject] = React.useState<ProjectDetailData | null>(null);
  const [files, setFiles] = React.useState<ProjectFile[]>([]);
  const [filesLoading, setFilesLoading] = React.useState(false);
  const [filesError, setFilesError] = React.useState('');
  const [filesInfo, setFilesInfo] = React.useState('');
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const currentUserId = profile?.user.id || null;
  const fallbackOrgId =
    activeOrgId || profile?.activeOrg.orgId || profile?.user.defaultOrgId || profile?.memberships?.[0]?.org_id || null;
  const resolvedOrgId = activeOrgId || fallbackOrgId;
  const currentOrgRole =
    profile?.activeOrg.orgRole ||
    profile?.memberships?.find((membership) => membership.org_id === resolvedOrgId)?.role ||
    null;
  const isOrgProjectManager = Boolean(profile?.user.globalRole === 'admin' || currentOrgRole === 'employer');
  const isProjectMember = Boolean(
    project &&
      currentUserId &&
      (String(project.ownerUserId || '') === String(currentUserId) ||
        project.members.some((member) => String(member.userId) === String(currentUserId)) ||
        project.currentUserHasTeamAccess),
  );
  const canManageFiles = isOrgProjectManager || (currentOrgRole === 'employee' && isProjectMember);

  React.useEffect(() => {
    if (!activeOrgId && resolvedOrgId) {
      void setActiveOrgId(resolvedOrgId);
    }
  }, [activeOrgId, resolvedOrgId, setActiveOrgId]);

  const loadProject = React.useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError('');

    try {
      if (!projectId) {
        throw new Error('Project id is missing in URL');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const data = await crmRequest(`/api/projects/${projectId}`, {
        token,
        orgId: resolvedOrgId,
        signal,
      });

      setProject(data as ProjectDetailData);
    } catch (loadError: any) {
      if (isAbortError(loadError)) {
        return;
      }
      setError(loadError?.message || 'Failed to load project detail');
      setProject(null);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, [getAccessToken, projectId, resolvedOrgId]);

  const loadFiles = React.useCallback(async (signal?: AbortSignal) => {
    setFilesLoading(true);
    setFilesError('');
    try {
      if (!projectId) {
        throw new Error('Project id is missing in URL');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      const data = await crmRequest(`/api/projects/${projectId}/files`, {
        token,
        orgId: resolvedOrgId,
        signal,
      });

      setFiles(Array.isArray(data) ? (data as ProjectFile[]) : []);
    } catch (loadError: any) {
      if (isAbortError(loadError)) {
        return;
      }
      setFilesError(loadError?.message || 'Failed to load project files');
    } finally {
      if (!signal?.aborted) {
        setFilesLoading(false);
      }
    }
  }, [getAccessToken, projectId, resolvedOrgId]);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        const commaIndex = result.indexOf(',');
        resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
      };
      reader.onerror = () => reject(new Error('Failed to read selected file'));
      reader.readAsDataURL(file);
    });

  const handleUploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadingFile(true);
    setFilesError('');
    setFilesInfo('');
    try {
      if (!canManageFiles) {
        throw new Error('You are not allowed to upload files for this project');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      if (!projectId) {
        throw new Error('Project id is missing in URL');
      }

      const base64 = await fileToBase64(file);
      await crmRequest(`/api/projects/${projectId}/files`, {
        token,
        orgId: resolvedOrgId,
        method: 'POST',
        body: {
          orgId: resolvedOrgId,
          fileName: file.name,
          mimeType: file.type,
          contentBase64: base64,
        },
      });

      await loadFiles();
      setFilesInfo('Project file uploaded.');
    } catch (uploadError: any) {
      setFilesError(uploadError?.message || 'Failed to upload project file');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setFilesError('');
    setFilesInfo('');
    try {
      if (!canManageFiles) {
        throw new Error('You are not allowed to delete files from this project');
      }

      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      if (!projectId) {
        throw new Error('Project id is missing in URL');
      }

      const data = await crmRequest(`/api/projects/${projectId}/files/${fileId}`, {
        token,
        orgId: resolvedOrgId,
        method: 'DELETE',
        body: {
          orgId: resolvedOrgId,
        },
      });

      setFiles(Array.isArray(data) ? (data as ProjectFile[]) : []);
      setFilesInfo('Project file deleted.');
    } catch (deleteError: any) {
      setFilesError(deleteError?.message || 'Failed to delete project file');
    }
  };

  React.useEffect(() => {
    const controller = new AbortController();

    Promise.all([loadProject(controller.signal), loadFiles(controller.signal)]).catch(() => {
      if (!controller.signal.aborted) {
        setLoading(false);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadFiles, loadProject]);

  const handleRefreshProject = () => {
    void loadProject();
  };

  const handleRefreshFiles = () => {
    void loadFiles();
  };

  return (
    <PageContainer title="Project Detail" description="Project detail workspace">
      <Breadcrumb title="Project Detail" items={BCrumb} />

      <BlankCard>
        <Stack spacing={3} p={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography variant="h5">{project?.name || 'Project Detail'}</Typography>
              <Typography variant="body2" color="textSecondary">
                {project?.code || 'No project code'}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => navigate('/apps/projects')}>
                Back To Projects
              </Button>
              <Button variant="contained" onClick={handleRefreshProject} disabled={loading}>
                Refresh
              </Button>
            </Stack>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}
          {loading ? <Typography>Loading project details...</Typography> : null}

          {!loading && project ? (
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Project Type</Typography>
                  {project.projectType ? (
                    <Chip
                      size="small"
                      label={project.projectType.name}
                      sx={{
                        width: 'fit-content',
                        backgroundColor: hexToRgba(project.projectType.color, 0.16),
                        color: getReadableTextColor(project.projectType.color),
                        border: `1px solid ${resolveUiColor(project.projectType.color)}`,
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      Unassigned
                    </Typography>
                  )}
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Status</Typography>
                  <Chip size="small" label={project.status} sx={{ width: 'fit-content' }} />
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Priority</Typography>
                  <Chip size="small" variant="outlined" label={project.priority} sx={{ width: 'fit-content' }} />
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Owner</Typography>
                  <Typography variant="body2">{project.ownerName || '-'}</Typography>
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Members</Typography>
                  <Typography variant="body2">{project.memberCount}</Typography>
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Teams</Typography>
                  <Typography variant="body2">{project.teamCount}</Typography>
                </Stack>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Start Date</Typography>
                  <Typography variant="body2">{formatDate(project.startDate)}</Typography>
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Due Date</Typography>
                  <Typography variant="body2">{formatDate(project.dueDate)}</Typography>
                </Stack>
                <Stack spacing={1} flex={1}>
                  <Typography variant="subtitle2">Updated</Typography>
                  <Typography variant="body2">{formatDate(project.updatedAt)}</Typography>
                </Stack>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Description</Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.description || 'No description added yet.'}
                </Typography>
              </Stack>

              <Stack spacing={1}>
                <Typography variant="subtitle2">Assigned Teams</Typography>
                {project.teams.length ? (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {project.teams.map((team) => (
                      <Chip
                        key={team.id}
                        size="small"
                        label={team.name}
                        sx={{
                          width: 'fit-content',
                          backgroundColor: hexToRgba(team.color, 0.16),
                          color: getReadableTextColor(team.color),
                          border: `1px solid ${resolveUiColor(team.color)}`,
                        }}
                      />
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No teams assigned.
                  </Typography>
                )}
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="subtitle2">Completion</Typography>
                <LinearProgress variant="determinate" value={project.summary.completionPercent} />
                <Typography variant="body2" color="textSecondary">
                  {project.summary.completionPercent}% complete
                </Typography>
              </Stack>

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Box flex={1} border={1} borderColor="divider" borderRadius={1.5} p={2}>
                  <Typography variant="subtitle1">Tickets</Typography>
                  <Typography variant="body2">Total: {project.summary.tickets.total}</Typography>
                  <Typography variant="body2">Open: {project.summary.tickets.open}</Typography>
                  <Typography variant="body2">Pending: {project.summary.tickets.pending}</Typography>
                  <Typography variant="body2">Closed: {project.summary.tickets.closed}</Typography>
                </Box>
                <Box flex={1} border={1} borderColor="divider" borderRadius={1.5} p={2}>
                  <Typography variant="subtitle1">Calendar</Typography>
                  <Typography variant="body2">Total Events: {project.summary.calendar.total}</Typography>
                  <Typography variant="body2">Upcoming: {project.summary.calendar.upcoming}</Typography>
                  <Typography variant="body2">
                    Next Event: {formatDate(project.summary.calendar.nextEventAt)}
                  </Typography>
                </Box>
                <Box flex={1} border={1} borderColor="divider" borderRadius={1.5} p={2}>
                  <Typography variant="subtitle1">Kanban</Typography>
                  <Typography variant="body2">Total Tasks: {project.summary.kanban.total}</Typography>
                  <Typography variant="body2">Done: {project.summary.kanban.done}</Typography>
                  <Typography variant="body2">In Progress: {project.summary.kanban.inProgress}</Typography>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={1}>
                <Typography variant="h6">Assigned Team</Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Role</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {project.members.map((member) => (
                        <TableRow key={member.userId}>
                          <TableCell>{member.fullName}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Chip size="small" label={member.memberRole} />
                          </TableCell>
                        </TableRow>
                      ))}
                      {project.members.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3}>
                            <Typography variant="body2" color="textSecondary">
                              No assigned members yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>

              <Divider />

              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                <Box flex={1} border={1} borderColor="divider" borderRadius={1.5} p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recent Tickets
                  </Typography>
                  <Stack spacing={1}>
                    {project.recent.tickets.map((ticket) => (
                      <Box key={ticket.id}>
                        <Typography variant="body2">{ticket.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {ticket.status} | {formatDate(ticket.createdAt)}
                        </Typography>
                      </Box>
                    ))}
                    {project.recent.tickets.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        No tickets linked yet.
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>

                <Box flex={1} border={1} borderColor="divider" borderRadius={1.5} p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Upcoming Events
                  </Typography>
                  <Stack spacing={1}>
                    {project.recent.events.map((event) => (
                      <Box key={event.id}>
                        <Typography variant="body2">{event.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {formatDate(event.startsAt)}
                        </Typography>
                      </Box>
                    ))}
                    {project.recent.events.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        No events linked yet.
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>

                <Box flex={1} border={1} borderColor="divider" borderRadius={1.5} p={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Recent Kanban Tasks
                  </Typography>
                  <Stack spacing={1}>
                    {project.recent.tasks.map((task) => (
                      <Box key={task.id}>
                        <Typography variant="body2">{task.title}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {(task.listName || 'No list') + ' | ' + formatDate(task.dueDate)}
                        </Typography>
                      </Box>
                    ))}
                    {project.recent.tasks.length === 0 ? (
                      <Typography variant="body2" color="textSecondary">
                        No tasks linked yet.
                      </Typography>
                    ) : null}
                  </Stack>
                </Box>
              </Stack>

              <Divider />

              <Stack spacing={2}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                  <Typography variant="h6">Project Documents</Typography>
                  {canManageFiles ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        disabled={uploadingFile}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingFile ? 'Uploading...' : 'Upload File'}
                      </Button>
                      <Button variant="text" disabled={filesLoading} onClick={handleRefreshFiles}>
                        Refresh Files
                      </Button>
                    </Stack>
                  ) : (
                    <Button variant="text" disabled={filesLoading} onClick={handleRefreshFiles}>
                      Refresh Files
                    </Button>
                  )}
                </Stack>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.csv,.doc,.docx,.xls,.xlsx"
                  style={{ display: 'none' }}
                  onChange={handleUploadFile}
                />

                {filesError ? <Alert severity="error">{filesError}</Alert> : null}
                {filesInfo ? <Alert severity="success">{filesInfo}</Alert> : null}
                {filesLoading ? <Typography>Loading project files...</Typography> : null}

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>File</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Size</TableCell>
                        <TableCell>Uploaded By</TableCell>
                        <TableCell>Uploaded At</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {files.map((projectFile) => (
                        <TableRow key={projectFile.id}>
                          <TableCell>{projectFile.fileName}</TableCell>
                          <TableCell>{projectFile.mimeType}</TableCell>
                          <TableCell>{formatBytes(projectFile.fileSizeBytes)}</TableCell>
                          <TableCell>{projectFile.uploadedByName || '-'}</TableCell>
                          <TableCell>{formatDate(projectFile.createdAt)}</TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                              {projectFile.url ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  component="a"
                                  href={projectFile.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open
                                </Button>
                              ) : null}
                              {canManageFiles ? (
                                <Button
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                  onClick={() => handleDeleteFile(projectFile.id)}
                                >
                                  Delete
                                </Button>
                              ) : null}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                      {!filesLoading && files.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography variant="body2" color="textSecondary">
                              No files uploaded yet.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Stack>
            </Stack>
          ) : null}
        </Stack>
      </BlankCard>
    </PageContainer>
  );
};

export default ProjectDetail;
