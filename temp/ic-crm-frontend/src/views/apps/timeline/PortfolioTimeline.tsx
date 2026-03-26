import React from 'react';
import {
  Alert,
  Box,
  Button,
  Drawer,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import { crmRequest } from 'src/api/crm/client';
import { useAuth } from 'src/context/AuthContext';
import { isAbortError } from 'src/lib/fetchWithTimeout';
import { PortfolioTimelineItem, PortfolioTimelineResponse, TimelineGroupBy, TimelineStatus } from 'src/types/timeline';
import { formatTimelineDateRange } from './timelineUtils';
import PortfolioTimelineBoard from './components/PortfolioTimelineBoard';

type TeamFilterOption = {
  id: string;
  name: string;
};

const PortfolioTimeline = () => {
  const navigate = useNavigate();
  const { activeOrgId, getAccessToken, profile, setActiveOrgId } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [data, setData] = React.useState<PortfolioTimelineResponse | null>(null);
  const [teamOptions, setTeamOptions] = React.useState<TeamFilterOption[]>([]);
  const [selectedItem, setSelectedItem] = React.useState<PortfolioTimelineItem | null>(null);
  const hasAutoCenteredRef = React.useRef(false);

  const [groupBy, setGroupBy] = React.useState<TimelineGroupBy>('project');
  const [status, setStatus] = React.useState<TimelineStatus | ''>('');
  const [projectTypeId, setProjectTypeId] = React.useState('');
  const [teamId, setTeamId] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');

  const fallbackOrgId =
    activeOrgId || profile?.activeOrg.orgId || profile?.user.defaultOrgId || profile?.memberships?.[0]?.org_id || null;
  const resolvedOrgId = activeOrgId || fallbackOrgId;

  React.useEffect(() => {
    if (!activeOrgId && resolvedOrgId) {
      void setActiveOrgId(resolvedOrgId);
    }
  }, [activeOrgId, resolvedOrgId, setActiveOrgId]);

  const loadPortfolio = React.useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');

      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error('Missing session token');
        }

        const query = new URLSearchParams();
        query.set('groupBy', groupBy);
        if (status) {
          query.set('status', status);
        }
        if (projectTypeId) {
          query.set('projectTypeId', projectTypeId);
        }
        if (teamId) {
          query.set('teamId', teamId);
        }
        if (startDate) {
          query.set('startDate', startDate);
        }
        if (endDate) {
          query.set('endDate', endDate);
        }

        const [portfolioData, teamsData] = await Promise.all([
          crmRequest(`/api/timeline/portfolio?${query.toString()}`, {
            token,
            orgId: resolvedOrgId,
            signal,
          }),
          crmRequest('/api/teams', {
            token,
            orgId: resolvedOrgId,
            signal,
          }),
        ]);

        const nextData = portfolioData as PortfolioTimelineResponse;
        hasAutoCenteredRef.current = false;
        setData(nextData);
        setTeamOptions(
          Array.isArray(teamsData)
            ? (teamsData as Array<{ id: string; name: string }>).map((team) => ({
                id: team.id,
                name: team.name,
              }))
            : [],
        );
      } catch (loadError: any) {
        if (isAbortError(loadError)) {
          return;
        }
        setError(loadError?.message || 'Failed to load portfolio timeline');
        setData(null);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [endDate, getAccessToken, groupBy, projectTypeId, resolvedOrgId, startDate, status, teamId],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    loadPortfolio(controller.signal).catch(() => undefined);
    return () => controller.abort();
  }, [loadPortfolio]);

  const scrollToToday = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById('portfolio-today-marker');
    if (!element) {
      return;
    }

    window.requestAnimationFrame(() => {
      element.scrollIntoView({
        behavior,
        block: 'nearest',
        inline: 'center',
      });
    });
  }, []);

  React.useEffect(() => {
    if (!data || hasAutoCenteredRef.current) {
      return;
    }

    hasAutoCenteredRef.current = true;
    scrollToToday('auto');
  }, [data, scrollToToday]);

  return (
    <PageContainer title="Timeline" description="Portfolio timeline">
      <Breadcrumb
        title="Timeline"
        items={[
          { to: '/', title: 'Home' },
          { title: 'Timeline' },
        ]}
      />

      <BlankCard sx={{ p: 3 }}>
        {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', xl: 'row' }}
            justifyContent="space-between"
            spacing={2}
            alignItems={{ xs: 'flex-start', xl: 'center' }}
          >
            <Box>
              <Typography variant="h3">Timeline Portfolio</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Org-scoped portfolio view. Global admin sees the currently selected organization.
              </Typography>
            </Box>
            <Button variant="outlined" onClick={() => navigate('/apps/projects')}>
              Open Projects
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="timeline-group-by-label">Group By</InputLabel>
              <Select
                labelId="timeline-group-by-label"
                label="Group By"
                value={groupBy}
                onChange={(event) => setGroupBy(event.target.value as TimelineGroupBy)}
              >
                <MenuItem value="project">Project</MenuItem>
                <MenuItem value="projectType">Project Type</MenuItem>
                <MenuItem value="team">Team</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 180 }}>
              <InputLabel id="timeline-status-filter-label">Status</InputLabel>
              <Select
                labelId="timeline-status-filter-label"
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value as TimelineStatus | '')}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="planned">Planned</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="timeline-project-type-filter-label">Project Type</InputLabel>
              <Select
                labelId="timeline-project-type-filter-label"
                label="Project Type"
                value={projectTypeId}
                onChange={(event) => setProjectTypeId(String(event.target.value))}
              >
                <MenuItem value="">All project types</MenuItem>
                {data?.categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 220 }}>
              <InputLabel id="timeline-team-filter-label">Team</InputLabel>
              <Select
                labelId="timeline-team-filter-label"
                label="Team"
                value={teamId}
                onChange={(event) => setTeamId(String(event.target.value))}
              >
                <MenuItem value="">All teams</MenuItem>
                {teamOptions.map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>

          {data ? (
            <>
              {data.lanes.length ? (
                <PortfolioTimelineBoard
                  lanes={data.lanes}
                  window={data.window}
                  selectedItemId={selectedItem?.id || null}
                  onSelect={setSelectedItem}
                />
              ) : (
                <Alert severity="info">No timeline items match the current filter window.</Alert>
              )}
            </>
          ) : null}
        </Stack>
      </BlankCard>

      <Drawer
        anchor="right"
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItem(null)}
        PaperProps={{ sx: { width: 420 } }}
      >
        {selectedItem ? (
          <Stack spacing={2.5} sx={{ p: 3 }}>
            <Typography variant="h4">{selectedItem.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedItem.projectName}
              {selectedItem.projectCode ? ` · ${selectedItem.projectCode}` : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTimelineDateRange(selectedItem.startDate, selectedItem.endDate)}
            </Typography>
            <Typography variant="body1">{selectedItem.summary || 'No summary added yet.'}</Typography>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={() => navigate(`/apps/projects/${selectedItem.projectId}/timeline`)}>
                Open Project Timeline
              </Button>
              <Button variant="outlined" onClick={() => navigate(`/apps/projects/${selectedItem.projectId}`)}>
                Open Project
              </Button>
            </Stack>
          </Stack>
        ) : null}
      </Drawer>
    </PageContainer>
  );
};

export default PortfolioTimeline;
