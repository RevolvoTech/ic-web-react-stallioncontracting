import React, { useContext } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import useSWR from 'swr';
import { TicketContext } from 'src/context/TicketContext';
import { getFetcher } from 'src/api/globalFetcher';
import { useAuth } from 'src/context/AuthContext';

const BoxStyled = styled(Box)(() => ({
  padding: '30px',
  transition: '0.1s ease-in',
  cursor: 'pointer',
  color: 'inherit',
  '&:hover': {
    transform: 'scale(1.03)',
  },
}));

type MemberItem = {
  userId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
};

type ProjectItem = {
  id: string;
  name: string;
};

type TicketFormState = {
  ticketTitle: string;
  ticketDescription: string;
  Status: string;
  projectId: string;
  agentUserId: string;
};

const defaultForm: TicketFormState = {
  ticketTitle: '',
  ticketDescription: '',
  Status: 'Open',
  projectId: '',
  agentUserId: '',
};

const TicketFilter = () => {
  const { tickets, setFilter, addTicket }: any = useContext(TicketContext);
  const { profile } = useAuth();
  const { data: membersData } = useSWR('/api/users/members', getFetcher);
  const { data: projectsData } = useSWR('/api/projects', getFetcher);
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState<TicketFormState>(defaultForm);
  const pendingC = tickets.filter((t: { Status: string; }) => t.Status === 'Pending').length;
  const openC = tickets.filter((t: { Status: string; }) => t.Status === 'Open').length;
  const closeC = tickets.filter((t: { Status: string; }) => t.Status === 'Closed').length;
  const canWrite = Boolean(profile && !profile.permissions.readOnly);
  const members = (Array.isArray(membersData?.data) ? membersData.data : []) as MemberItem[];
  const activeMembers = members.filter((member) => member.isActive);
  const projects = (Array.isArray(projectsData?.data) ? projectsData.data : []) as ProjectItem[];

  React.useEffect(() => {
    if (!open || form.agentUserId || !profile?.user.id) {
      return;
    }

    const currentMember = activeMembers.find((member) => member.userId === profile.user.id);
    if (currentMember) {
      setForm((prev) => ({
        ...prev,
        agentUserId: currentMember.userId,
      }));
    }
  }, [activeMembers, form.agentUserId, open, profile?.user.id]);

  const handleOpen = () => {
    setError('');
    setForm({
      ...defaultForm,
      agentUserId: profile?.user.id || '',
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSaving(false);
    setError('');
    setForm(defaultForm);
  };

  const handleFieldChange =
    (field: keyof TicketFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any) => {
      setForm((prev) => ({
        ...prev,
        [field]: String(event.target.value),
      }));
    };

  const getMemberName = (member: MemberItem) =>
    `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.email;

  const handleSubmit = async () => {
    setSaving(true);
    setError('');

    try {
      if (!form.ticketTitle.trim()) {
        throw new Error('Ticket title is required');
      }

      await addTicket({
        ticketTitle: form.ticketTitle.trim(),
        ticketDescription: form.ticketDescription.trim(),
        Status: form.Status,
        projectId: form.projectId || null,
        agentUserId: form.agentUserId || null,
      });

      handleClose();
    } catch (submitError: any) {
      setError(submitError?.message || 'Failed to create ticket');
      setSaving(false);
    }
  };



  return (
    (<>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ sm: 'center' }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5">Tickets Workspace</Typography>
          <Typography variant="body2" color="textSecondary">
            Create and manage project tickets from one place.
          </Typography>
        </Box>
        {canWrite ? (
          <Button variant="contained" onClick={handleOpen}>
            Create Ticket
          </Button>
        ) : null}
      </Stack>
      <Grid container spacing={3} textAlign="center">
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12
        }}>
        <BoxStyled
          onClick={() => setFilter('total_tickets')}
          sx={{ backgroundColor: 'primary.light', color: 'primary.main' }}
        >
          <Typography variant="h3">{tickets.length}</Typography>
          <Typography variant="h6">Total Tickets</Typography>
        </BoxStyled>
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12
        }}>
        <BoxStyled
          onClick={() => setFilter('Pending')}
          sx={{ backgroundColor: 'warning.light', color: 'warning.main' }}
        >
          <Typography variant="h3">{pendingC}</Typography>
          <Typography variant="h6">Pending Tickets</Typography>
        </BoxStyled>
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12
        }}>
        <BoxStyled
          onClick={() => setFilter('Open')}
          sx={{ backgroundColor: 'success.light', color: 'success.main' }}
        >
          <Typography variant="h3">{openC}</Typography>
          <Typography variant="h6">Open Tickets</Typography>
        </BoxStyled>
      </Grid>
      <Grid
        size={{
          lg: 3,
          sm: 6,
          xs: 12
        }}>
        <BoxStyled
          onClick={() => setFilter('Closed')}
          sx={{ backgroundColor: 'error.light', color: 'error.main' }}
        >
          <Typography variant="h3">{closeC}</Typography>
          <Typography variant="h6">Closed Tickets</Typography>
        </BoxStyled>
      </Grid>
    </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Create Ticket</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {error ? <Alert severity="error">{error}</Alert> : null}
            <TextField
              label="Ticket"
              value={form.ticketTitle}
              onChange={handleFieldChange('ticketTitle')}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={form.ticketDescription}
              onChange={handleFieldChange('ticketDescription')}
              fullWidth
              multiline
              minRows={3}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id="ticket-assigned-label">Assigned To</InputLabel>
                <Select
                  labelId="ticket-assigned-label"
                  label="Assigned To"
                  value={form.agentUserId}
                  onChange={handleFieldChange('agentUserId')}
                >
                  {activeMembers.map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {getMemberName(member)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id="ticket-status-label">Status</InputLabel>
                <Select
                  labelId="ticket-status-label"
                  label="Status"
                  value={form.Status}
                  onChange={handleFieldChange('Status')}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <FormControl fullWidth>
              <InputLabel id="ticket-project-label">Project</InputLabel>
              <Select
                labelId="ticket-project-label"
                label="Project"
                value={form.projectId}
                onChange={handleFieldChange('projectId')}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={saving || !form.ticketTitle.trim()}>
            {saving ? 'Creating...' : 'Create Ticket'}
          </Button>
        </DialogActions>
      </Dialog>
    </>)
  );
};

export default TicketFilter;
