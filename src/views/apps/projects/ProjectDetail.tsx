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

type ProjectMember = {
  userId: string;
  memberRole: 'owner' | 'member';
  email: string;
  fullName: string;
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
  members: ProjectMember[];
  memberCount: number;
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
  const { activeOrgId, getAccessToken, profile } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [project, setProject] = React.useState<ProjectDetailData | null>(null);
  const [files, setFiles] = React.useState<ProjectFile[]>([]);
  const [filesLoading, setFilesLoading] = React.useState(false);
  const [filesError, setFilesError] = React.useState('');
  const [filesInfo, setFilesInfo] = React.useState('');
  const [uploadingFile, setUploadingFile] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const canWrite = Boolean(profile && !profile.permissions.readOnly);

  const loadProject = React.useCallback(async () => {
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
        orgId: activeOrgId,
      });

      setProject(data as ProjectDetailData);
    } catch (loadError: any) {
      setError(loadError?.message || 'Failed to load project detail');
      setProject(null);
    } finally {
      setLoading(false);
    }
  }, [activeOrgId, getAccessToken, projectId]);

  const loadFiles = React.useCallback(async () => {
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
        orgId: activeOrgId,
      });

      setFiles(Array.isArray(data) ? (data as ProjectFile[]) : []);
    } catch (loadError: any) {
      setFilesError(loadError?.message || 'Failed to load project files');
    } finally {
      setFilesLoading(false);
    }
  }, [activeOrgId, getAccessToken, projectId]);

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
        orgId: activeOrgId,
        method: 'POST',
        body: {
          orgId: activeOrgId,
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
      const token = await getAccessToken();
      if (!token) {
        throw new Error('Missing session token');
      }

      if (!projectId) {
        throw new Error('Project id is missing in URL');
      }

      const data = await crmRequest(`/api/projects/${projectId}/files/${fileId}`, {
        token,
        orgId: activeOrgId,
        method: 'DELETE',
        body: {
          orgId: activeOrgId,
        },
      });

      setFiles(Array.isArray(data) ? (data as ProjectFile[]) : []);
      setFilesInfo('Project file deleted.');
    } catch (deleteError: any) {
      setFilesError(deleteError?.message || 'Failed to delete project file');
    }
  };

  React.useEffect(() => {
    Promise.all([loadProject(), loadFiles()]).catch(() => {
      setLoading(false);
    });
  }, [loadFiles, loadProject]);

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
              <Button variant="contained" onClick={loadProject} disabled={loading}>
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
                  {canWrite ? (
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        disabled={uploadingFile}
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {uploadingFile ? 'Uploading...' : 'Upload File'}
                      </Button>
                      <Button variant="text" disabled={filesLoading} onClick={loadFiles}>
                        Refresh Files
                      </Button>
                    </Stack>
                  ) : (
                    <Button variant="text" disabled={filesLoading} onClick={loadFiles}>
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
                              {canWrite ? (
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
