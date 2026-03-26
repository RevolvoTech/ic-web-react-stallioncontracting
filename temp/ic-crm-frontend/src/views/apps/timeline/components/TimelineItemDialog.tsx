import React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ProjectTypeOption } from 'src/types/projectTypes';
import { ProjectTimelineResponse, TimelineItem, TimelineItemKind, TimelineLinkKind, TimelineLinkOption, TimelineMember, TimelineTeam } from 'src/types/timeline';

type DialogMode = 'create' | 'edit';

type TimelinePointDraft = {
  id?: string;
  title: string;
  detail: string;
  sortOrder: number;
};

type TimelineEditorPayload = {
  itemKind: TimelineItemKind;
  title: string;
  summary: string;
  status: TimelineItem['status'];
  startDate: string;
  endDate: string;
  categoryProjectTypeId: string;
  assignedTeamId: string;
  assignedUserId: string;
  sortOrder: number;
  points: Array<{
    id?: string;
    title: string;
    detail: string;
    sortOrder: number;
  }>;
  links: Array<{
    linkedKind: TimelineLinkKind;
    linkedId: string;
  }>;
};

type TimelineItemDialogProps = {
  open: boolean;
  mode: DialogMode;
  item: TimelineItem | null;
  defaultKind: TimelineItemKind;
  categories: ProjectTypeOption[];
  members: TimelineMember[];
  teams: TimelineTeam[];
  availableLinks: ProjectTimelineResponse['availableLinks'];
  canManage: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: TimelineEditorPayload) => Promise<void> | void;
};

type LinkOptionDraft = TimelineLinkOption & {
  groupLabel: string;
};

const makeLinkOptions = (availableLinks: ProjectTimelineResponse['availableLinks']): LinkOptionDraft[] => [
  ...availableLinks.tickets.map((option) => ({ ...option, groupLabel: 'Tickets' })),
  ...availableLinks.calendarEvents.map((option) => ({ ...option, groupLabel: 'Calendar' })),
  ...availableLinks.kanbanTasks.map((option) => ({ ...option, groupLabel: 'Kanban' })),
  ...availableLinks.files.map((option) => ({ ...option, groupLabel: 'Files' })),
];

const TimelineItemDialog = ({
  open,
  mode,
  item,
  defaultKind,
  categories,
  members,
  teams,
  availableLinks,
  canManage,
  saving,
  onClose,
  onSave,
}: TimelineItemDialogProps) => {
  const [itemKind, setItemKind] = React.useState<TimelineItemKind>(defaultKind);
  const [title, setTitle] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [status, setStatus] = React.useState<TimelineItem['status']>('planned');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [categoryProjectTypeId, setCategoryProjectTypeId] = React.useState('');
  const [assignedTeamId, setAssignedTeamId] = React.useState('');
  const [assignedUserId, setAssignedUserId] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState(100);
  const [points, setPoints] = React.useState<TimelinePointDraft[]>([]);
  const [selectedLinks, setSelectedLinks] = React.useState<LinkOptionDraft[]>([]);

  const linkOptions = React.useMemo(() => makeLinkOptions(availableLinks), [availableLinks]);

  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (item) {
      const existingLinks = item.links.map((link) => ({
        linkedKind: link.linkedKind,
        linkedId: link.linkedId,
        title: link.record.title,
        subtitle: link.record.subtitle,
        detail: link.record.detail,
        groupLabel:
          link.linkedKind === 'ticket'
            ? 'Tickets'
            : link.linkedKind === 'calendar_event'
              ? 'Calendar'
              : link.linkedKind === 'kanban_task'
                ? 'Kanban'
                : 'Files',
      }));

      setItemKind(item.itemKind);
      setTitle(item.title);
      setSummary(item.summary);
      setStatus(item.status);
      setStartDate(item.startDate || '');
      setEndDate(item.endDate || '');
      setCategoryProjectTypeId(item.categoryProjectTypeId || '');
      setAssignedTeamId(item.assignedTeamId || '');
      setAssignedUserId(item.assignedUserId || '');
      setSortOrder(item.sortOrder);
      setPoints(
        item.points.length
          ? item.points.map((point) => ({
              id: point.id,
              title: point.title,
              detail: point.detail,
              sortOrder: point.sortOrder,
            }))
          : [{ title: '', detail: '', sortOrder: 100 }],
      );
      setSelectedLinks(existingLinks);
      return;
    }

    setItemKind(defaultKind);
    setTitle('');
    setSummary('');
    setStatus(defaultKind === 'phase' ? 'active' : 'planned');
    setStartDate('');
    setEndDate('');
    setCategoryProjectTypeId('');
    setAssignedTeamId('');
    setAssignedUserId('');
    setSortOrder(100);
    setPoints([{ title: '', detail: '', sortOrder: 100 }]);
    setSelectedLinks([]);
  }, [defaultKind, item, open]);

  const effectiveCanManage = canManage;
  const selectedLinkOptions = React.useMemo(() => {
    const merged = [...linkOptions];
    selectedLinks.forEach((option) => {
      if (!merged.some((candidate) => candidate.linkedKind === option.linkedKind && candidate.linkedId === option.linkedId)) {
        merged.push(option);
      }
    });
    return merged;
  }, [linkOptions, selectedLinks]);

  const handlePointChange = (index: number, field: keyof TimelinePointDraft, value: string | number) => {
    setPoints((current) =>
      current.map((point, currentIndex) =>
        currentIndex === index
          ? {
              ...point,
              [field]: value,
            }
          : point,
      ),
    );
  };

  const handleSave = async () => {
    await onSave({
      itemKind,
      title,
      summary,
      status,
      startDate,
      endDate,
      categoryProjectTypeId,
      assignedTeamId,
      assignedUserId,
      sortOrder,
      points: points
        .filter((point) => point.title.trim())
        .map((point, index) => ({
          id: point.id,
          title: point.title.trim(),
          detail: point.detail.trim(),
          sortOrder: point.sortOrder || (index + 1) * 100,
        })),
      links: selectedLinks.map((link) => ({
        linkedKind: link.linkedKind,
        linkedId: link.linkedId,
      })),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{mode === 'create' ? 'Add Timeline Item' : 'Edit Timeline Item'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.25}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth>
              <InputLabel id="timeline-item-kind-label">Type</InputLabel>
              <Select
                labelId="timeline-item-kind-label"
                label="Type"
                value={itemKind}
                disabled={!effectiveCanManage}
                onChange={(event) => setItemKind(event.target.value as TimelineItemKind)}
              >
                <MenuItem value="phase">Phase</MenuItem>
                <MenuItem value="milestone">Milestone</MenuItem>
                <MenuItem value="update">Update</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="timeline-status-label">Status</InputLabel>
              <Select
                labelId="timeline-status-label"
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TimelineItem['status'])}
              >
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <TextField label="Title" value={title} onChange={(event) => setTitle(event.target.value)} fullWidth />
          <TextField
            label="Summary"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            multiline
            minRows={2}
            fullWidth
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl fullWidth disabled={!effectiveCanManage}>
              <InputLabel id="timeline-category-label">Category</InputLabel>
              <Select
                labelId="timeline-category-label"
                label="Category"
                value={categoryProjectTypeId}
                onChange={(event) => setCategoryProjectTypeId(String(event.target.value))}
              >
                <MenuItem value="">Inherit Project Type</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!effectiveCanManage}>
              <InputLabel id="timeline-team-label">Team</InputLabel>
              <Select
                labelId="timeline-team-label"
                label="Team"
                value={assignedTeamId}
                onChange={(event) => setAssignedTeamId(String(event.target.value))}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {teams.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth disabled={!effectiveCanManage}>
              <InputLabel id="timeline-user-label">Owner</InputLabel>
              <Select
                labelId="timeline-user-label"
                label="Owner"
                value={assignedUserId}
                onChange={(event) => setAssignedUserId(String(event.target.value))}
              >
                <MenuItem value="">Unassigned</MenuItem>
                {members.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.fullName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {effectiveCanManage ? (
            <TextField
              label="Sort Order"
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(Number(event.target.value || 100))}
              fullWidth
            />
          ) : null}

          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
              <Typography variant="h6">Bullet Points</Typography>
              <Button
                startIcon={<AddIcon />}
                onClick={() =>
                  setPoints((current) => [
                    ...current,
                    { title: '', detail: '', sortOrder: (current.length + 1) * 100 },
                  ])
                }
              >
                Add Bullet
              </Button>
            </Stack>

            <Stack spacing={1.5}>
              {points.map((point, index) => (
                <Box
                  key={`${point.id || 'new'}-${index}`}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Stack spacing={1.25} flex={1}>
                      <TextField
                        label={`Bullet ${index + 1}`}
                        value={point.title}
                        onChange={(event) => handlePointChange(index, 'title', event.target.value)}
                        fullWidth
                      />
                      <TextField
                        label="Detail"
                        value={point.detail}
                        onChange={(event) => handlePointChange(index, 'detail', event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    </Stack>
                    <IconButton
                      aria-label="Remove bullet"
                      onClick={() =>
                        setPoints((current) =>
                          current.length > 1 ? current.filter((_, currentIndex) => currentIndex !== index) : current,
                        )
                      }
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </Box>

          <Box>
            <Typography variant="h6" gutterBottom>
              Linked Records
            </Typography>
            <Autocomplete
              multiple
              options={selectedLinkOptions}
              value={selectedLinks}
              onChange={(_, nextValue) => setSelectedLinks(nextValue)}
              groupBy={(option) => option.groupLabel}
              getOptionLabel={(option) => option.title}
              isOptionEqualToValue={(option, value) =>
                option.linkedKind === value.linkedKind && option.linkedId === value.linkedId
              }
              renderInput={(params) => <TextField {...params} label="Search tickets, events, tasks, or files" />}
            />
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving || !title.trim()}>
          {mode === 'create' ? 'Create Item' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TimelineItemDialog;
