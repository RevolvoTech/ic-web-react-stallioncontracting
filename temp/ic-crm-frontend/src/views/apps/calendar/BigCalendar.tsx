// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import {
  CardContent,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Fab,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import dayjs from 'dayjs';
import './Calendar.css';
import PageContainer from 'src/components/container/PageContainer';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { IconCheck } from '@tabler/icons-react';
import BlankCard from 'src/components/shared/BlankCard';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import useSWR from 'swr';
import { deleteFetcher, getFetcher, postFetcher, putFetcher } from 'src/api/globalFetcher';
import { ProjectTypeOption } from 'src/types/projectTypes';
import { getReadableTextColor, hexToRgba, isHexColor, resolveUiColor } from 'src/lib/projectTypeColors';

moment.locale('en-GB');
const localizer = momentLocalizer(moment);

type EvType = {
  id?: number | string;
  title?: string;
  allDay?: boolean;
  start?: Date;
  end?: Date;
  color?: string;
  projectId?: string | null;
  kind?: 'calendar' | 'project_timeline';
  projectType?: ProjectTypeOption | null;
};

type CalendarProject = {
  id: string;
  name: string;
  projectType: ProjectTypeOption | null;
  startDate?: string | null;
  dueDate?: string | null;
};

const BCrumb = [
  {
    to: '/',
    title: 'Home',
  },
  {
    title: 'Calendar',
  },
];


const BigCalendar = ({ isBreadcrumb = true }: { isBreadcrumb?: boolean }) => {
  const [calevents, setCalEvents] = React.useState<EvType[]>([]);
  const [open, setOpen] = React.useState<boolean>(false);
  const [title, setTitle] = React.useState<string>("");
  const [slot, setSlot] = React.useState<EvType>();
  const [start, setStart] = React.useState<any | null>(dayjs());
  const [end, setEnd] = React.useState<any | null>(dayjs());
  const [color, setColor] = React.useState<string>("default");
  const [projectId, setProjectId] = React.useState<string>('');
  const [update, setUpdate] = React.useState<EvType | null>(null);
  const { data: calendarData, mutate } = useSWR('/api/data/calendar/CalendarEvents', getFetcher);
  const { data: projectsData } = useSWR('/api/projects', getFetcher);
  const projects = React.useMemo(
    () => (Array.isArray(projectsData?.data) ? (projectsData.data as CalendarProject[]) : []),
    [projectsData],
  );
  const selectedProject = React.useMemo(
    () => projects.find((project) => project.id === projectId) || null,
    [projectId, projects],
  );

  const ColorVariation = [
    {
      id: 1,
      eColor: "#1a97f5",
      value: "default",
    },
    {
      id: 2,
      eColor: "#39b69a",
      value: "green",
    },
    {
      id: 3,
      eColor: "#fc4b6c",
      value: "red",
    },
    {
      id: 4,
      eColor: "#615dff",
      value: "azure",
    },
    {
      id: 5,
      eColor: "#fdd43f",
      value: "warning",
    },
  ];
  const normalizeUiEvents = (events: any[]) =>
    events
      .map((item) => {
        const parsedStart = new Date(item.start);
        const parsedEnd = new Date(item.end);
        if (Number.isNaN(parsedStart.getTime()) || Number.isNaN(parsedEnd.getTime())) {
          return null;
        }

        return {
          id: item.id,
          title: item.title,
          start: parsedStart,
          end: parsedEnd,
          color: item.color || 'default',
          allDay: Boolean(item.allDay),
          projectId: item.projectId || null,
          kind: 'calendar',
          projectType: item.projectType || null,
        } as EvType;
      })
      .filter(Boolean) as EvType[];

  React.useEffect(() => {
    if (calendarData?.data) {
      setCalEvents(normalizeUiEvents(calendarData.data));
    }
  }, [calendarData]);

  const projectTimelineEvents = React.useMemo(() => {
    return projects
      .map((project) => {
        if (!project?.id || !project?.startDate || !project?.dueDate) {
          return null;
        }

        const startDate = dayjs(project.startDate).startOf('day');
        const dueDate = dayjs(project.dueDate).startOf('day');
        if (!startDate.isValid() || !dueDate.isValid() || dueDate.isBefore(startDate)) {
          return null;
        }

        return {
          id: `project-timeline-${project.id}`,
          title: `${project.name} timeline`,
          start: startDate.toDate(),
          end: dueDate.add(1, 'day').toDate(),
          allDay: true,
          color: project.projectType?.color || 'azure',
          projectId: project.id,
          kind: 'project_timeline',
          projectType: project.projectType || null,
        } as EvType;
      })
      .filter(Boolean) as EvType[];
  }, [projects]);

  const mergedEvents = React.useMemo(
    () => [...calevents, ...projectTimelineEvents],
    [calevents, projectTimelineEvents],
  );

  const resetEditor = () => {
    setOpen(false);
    setTitle("");
    setStart(dayjs());
    setEnd(dayjs());
    setColor("default");
    setProjectId('');
    setUpdate(null);
    setSlot(undefined);
  };

  const addNewEventAlert = (slotInfo: EvType) => {
    setTitle('');
    setColor('default');
    setUpdate(null);
    setOpen(true);
    setSlot(slotInfo);
    setStart(dayjs(slotInfo.start || new Date()));
    setEnd(dayjs(slotInfo.end || slotInfo.start || new Date()));
  };


  const editEvent = (event: any) => {
    const newEditEvent = calevents.find(
      (elem: any) => String(elem.id) === String(event.id)
    );
    if (!newEditEvent) {
      return;
    }

    setTitle(newEditEvent.title || '');
    setColor(isHexColor(newEditEvent.color) ? 'default' : newEditEvent.color || 'default');
    setStart(dayjs(newEditEvent.start));
    setEnd(dayjs(newEditEvent.end));
    setProjectId((newEditEvent as any).projectId || '');
    setUpdate(newEditEvent);
    setOpen(true);
  };

  const updateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!update?.id || !start || !end || dayjs(start).isAfter(dayjs(end))) {
      return;
    }
    try {
      const response = await mutate(
        putFetcher('/api/calendar/update', {
          id: update.id,
          title,
          start: start.toISOString(),
          end: end.toISOString(),
          color,
          projectId: projectId || null,
          allDay: Boolean(update.allDay),
        }),
        false,
      );

      setCalEvents(normalizeUiEvents(response?.data || []));
      resetEditor();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update calendar event', error);
    }
  };
  const inputChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) =>
    setTitle(e.target.value);
  const selectinputChangeHandler = (id: string) => setColor(id);

  // When submitting or updating the event
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!start || !end || dayjs(start).isAfter(dayjs(end))) {
      return;
    }
    try {
      const response = await mutate(
        postFetcher('/api/calendar/add', {
          title,
          start: start.toISOString(),
          end: end.toISOString(),
          color,
          projectId: projectId || null,
          allDay: Boolean(slot?.allDay),
        }),
        false,
      );

      setCalEvents(normalizeUiEvents(response?.data || []));
      resetEditor();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to create calendar event', error);
    }
  };

  const deleteHandler = async (event: EvType) => {
    if (!event?.id) {
      return;
    }
    try {
      const response = await mutate(deleteFetcher('/api/calendar/delete', { id: event.id }), false);
      setCalEvents(normalizeUiEvents(response?.data || []));
      resetEditor();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete calendar event', error);
    }
  };

  const handleClose = () => {
    resetEditor();
  };

  const eventColors = (event: EvType) => {
    if (isHexColor(event.color)) {
      const resolved = resolveUiColor(event.color);
      return {
        style: {
          backgroundColor: hexToRgba(resolved, 0.16),
          color: getReadableTextColor(resolved),
          borderColor: resolved,
        },
      };
    }

    if (event.color) {
      return { className: `event-${event.color}` };
    }

    return { className: `event-default` };
  };

  const handleStartChange = (newValue: any) => {
    if (newValue instanceof Date) {
      // Convert the native Date object to a dayjs object
      setStart(dayjs(newValue));
    } else {
      setStart(newValue);
    }
  };

  const handleEndChange = (newValue: any) => {
    if (newValue instanceof Date) {
      // Convert the native Date object to a dayjs object
      setEnd(dayjs(newValue));
    } else {
      setEnd(newValue);
    }
  };

  const isDateRangeInvalid = start && end && dayjs(start).isAfter(dayjs(end));
  const linkedProjectColor = selectedProject?.projectType?.color || null;

  return (
    <PageContainer title="Calendar" description="this is Calendar">
      {isBreadcrumb ? <Breadcrumb title="Calendar" items={BCrumb} /> : null}
      <BlankCard>
        {/* ------------------------------------------- */}
        {/* Calendar */}
        {/* ------------------------------------------- */}
        <CardContent>
          <Calendar
            selectable
            events={mergedEvents}
            defaultView="month"
            scrollToTime={new Date(1970, 1, 1, 6)}
            defaultDate={new Date()}
            localizer={localizer}
            style={{ height: "calc(100vh - 350px" }}
            onSelectEvent={(event: any) => {
              if (event?.kind === 'project_timeline') {
                return;
              }
              editEvent(event);
            }}
            onSelectSlot={(slotInfo: any) => addNewEventAlert(slotInfo)}
            eventPropGetter={(event: any) => eventColors(event)}
          />
        </CardContent>
      </BlankCard>

      {/* ------------------------------------------- */}
      {/* Add Calendar Event Dialog */}
      {/* ------------------------------------------- */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
        <form onSubmit={update ? updateEvent : submitHandler}>
          <DialogContent>
            {/* ------------------------------------------- */}
            {/* Add Edit title */}
            {/* ------------------------------------------- */}
            <Typography variant="h4" sx={{ mb: 2 }}>
              {update ? "Update Event" : "Add Event"}
            </Typography>
            <Typography mb={3} variant="subtitle2">
              {!update
                ? "To add Event kindly fillup the title and choose the event color and press the add button"
                : "To Edit/Update Event kindly change the title and choose the event color and press the update button"}
              {slot?.title}
            </Typography>

            <TextField
              id="Event Title"
              placeholder="Enter Event Title"
              variant="outlined"
              fullWidth
              label="Event Title"
              value={title}
              sx={{ mb: 3 }}
              onChange={inputChangeHandler}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="calendar-project-label">Linked Project</InputLabel>
              <Select
                labelId="calendar-project-label"
                label="Linked Project"
                value={projectId}
                onChange={(event) => setProjectId(String(event.target.value))}
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {projects.map((project) => (
                  <MenuItem key={project.id} value={project.id}>
                    {project.name}
                    {project.projectType ? ` (${project.projectType.name})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {linkedProjectColor ? (
              <Typography
                variant="body2"
                sx={{
                  px: 1.5,
                  py: 1,
                  borderRadius: 1,
                  backgroundColor: hexToRgba(linkedProjectColor, 0.16),
                  color: getReadableTextColor(linkedProjectColor),
                  border: `1px solid ${resolveUiColor(linkedProjectColor)}`,
                }}
              >
                This event will use the linked project type color.
              </Typography>
            ) : null}
            {/* ------------------------------------------- */}
            {/* Selection of Start and end date */}
            {/* ------------------------------------------- */}
            <LocalizationProvider dateAdapter={AdapterDayjs}>

              <DatePicker
                value={start}
                onChange={handleStartChange}
                slotProps={{
                  textField: {
                    label: "Start Date",
                    fullWidth: true,
                    sx: { mb: 3 },
                  },
                }}
              />

              <DatePicker
                value={end}
                onChange={handleEndChange}
                slotProps={{
                  textField: {
                    label: "End Date",
                    fullWidth: true,
                    sx: { mb: 3 },
                    error: isDateRangeInvalid,
                    helperText: isDateRangeInvalid ? "End date must be later than start date" : "",
                  },
                }}
              />

            </LocalizationProvider>

            {/* ------------------------------------------- */}
            {/* Calendar Event Color*/}
            {/* ------------------------------------------- */}
            {!linkedProjectColor ? (
              <>
                <Typography variant="h6" fontWeight={600} my={2}>
                  Select Event Color
                </Typography>
                {ColorVariation.map((mcolor) => {
                  return (
                    <Fab
                      color="primary"
                      style={{ backgroundColor: mcolor.eColor }}
                      sx={{
                        marginRight: "3px",
                        transition: "0.1s ease-in",
                        scale: mcolor.value === color ? "0.9" : "0.7",
                      }}
                      size="small"
                      key={mcolor.id}
                      onClick={() => selectinputChangeHandler(mcolor.value)}
                    >
                      {mcolor.value === color ? <IconCheck width={16} /> : ""}
                    </Fab>
                  );
                })}
              </>
            ) : null}
          </DialogContent>
          {/* ------------------------------------------- */}
          {/* Action for dialog */}
          {/* ------------------------------------------- */}
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose}>Cancel</Button>

            {update ? (
              <Button
                type="button"
                color="error"
                variant="contained"
                onClick={() => deleteHandler(update)}
              >
                Delete
              </Button>
            ) : (
              ""
            )}
            <Button type="submit" disabled={!title || isDateRangeInvalid} variant="contained">
              {update ? "Update Event" : "Add Event"}
            </Button>
          </DialogActions>
          {/* ------------------------------------------- */}
          {/* End Calendar */}
          {/* ------------------------------------------- */}
        </form>
      </Dialog>
    </PageContainer>
  );
};

export default BigCalendar;
