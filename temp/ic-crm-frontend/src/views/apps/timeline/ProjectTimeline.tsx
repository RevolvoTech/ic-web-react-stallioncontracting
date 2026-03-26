import React from 'react';
import { Alert, Box, Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useNavigate, useParams } from 'react-router';
import PageContainer from 'src/components/container/PageContainer';
import BlankCard from 'src/components/shared/BlankCard';
import Breadcrumb from 'src/layouts/full/shared/breadcrumb/Breadcrumb';
import { crmRequest } from 'src/api/crm/client';
import { useAuth } from 'src/context/AuthContext';
import { isAbortError } from 'src/lib/fetchWithTimeout';
import { ProjectTimelineResponse, TimelineItem, TimelineItemKind } from 'src/types/timeline';
import TimelineDetailDrawer from './components/TimelineDetailDrawer';
import TimelineItemDialog from './components/TimelineItemDialog';
import TimelineRail from './components/TimelineRail';
import MilestoneCarousel from './components/MilestoneCarousel';

const ProjectTimeline = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { activeOrgId, getAccessToken, profile, setActiveOrgId } = useAuth();

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState('');
  const [info, setInfo] = React.useState('');
  const [data, setData] = React.useState<ProjectTimelineResponse | null>(null);
  const [selectedItemId, setSelectedItemId] = React.useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogMode, setDialogMode] = React.useState<'create' | 'edit'>('create');
  const [dialogKind, setDialogKind] = React.useState<TimelineItemKind>('update');
  const [editingItem, setEditingItem] = React.useState<TimelineItem | null>(null);
  const hasAutoCenteredRef = React.useRef(false);

  const fallbackOrgId =
    activeOrgId || profile?.activeOrg.orgId || profile?.user.defaultOrgId || profile?.memberships?.[0]?.org_id || null;
  const resolvedOrgId = activeOrgId || fallbackOrgId;
  const currentUserId = profile?.user.id || null;

  React.useEffect(() => {
    if (!activeOrgId && resolvedOrgId) {
      void setActiveOrgId(resolvedOrgId);
    }
  }, [activeOrgId, resolvedOrgId, setActiveOrgId]);

  const selectedItem = React.useMemo(
    () => data?.items.find((item) => item.id === selectedItemId) || null,
    [data?.items, selectedItemId],
  );
  const canEditSelectedItem = React.useMemo(() => {
    if (!selectedItem || !data) {
      return false;
    }
    if (data.permissions.canManage) {
      return true;
    }
    return selectedItem.itemKind === 'update' && String(selectedItem.createdBy || '') === String(currentUserId || '');
  }, [currentUserId, data, selectedItem]);

  const loadTimeline = React.useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError('');
      setInfo('');

      try {
        if (!projectId) {
          throw new Error('Project id is missing');
        }

        const token = await getAccessToken();
        if (!token) {
          throw new Error('Missing session token');
        }

        const response = await crmRequest(`/api/projects/${projectId}/timeline`, {
          token,
          orgId: resolvedOrgId,
          signal,
        });

        const nextData = response as ProjectTimelineResponse;
        hasAutoCenteredRef.current = false;
        setData(nextData);
        setSelectedItemId((current) =>
          nextData.items.some((item) => item.id === current) ? current : null,
        );
      } catch (loadError: any) {
        if (isAbortError(loadError)) {
          return;
        }
        setError(loadError?.message || 'Failed to load project timeline');
        setData(null);
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [getAccessToken, projectId, resolvedOrgId],
  );

  React.useEffect(() => {
    const controller = new AbortController();
    loadTimeline(controller.signal).catch(() => undefined);
    return () => controller.abort();
  }, [loadTimeline]);

  React.useEffect(() => {
    if (!selectedItemId) {
      return;
    }

    const element = document.getElementById(`timeline-item-${selectedItemId}`);
    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [selectedItemId]);

  const scrollToToday = React.useCallback((behavior: ScrollBehavior = 'smooth') => {
    const element = document.getElementById('timeline-today-marker');
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
    if (!data || selectedItemId || hasAutoCenteredRef.current) {
      return;
    }

    hasAutoCenteredRef.current = true;
    scrollToToday('auto');
  }, [data, scrollToToday, selectedItemId]);

  const openCreateDialog = (kind: TimelineItemKind) => {
    setDialogMode('create');
    setDialogKind(kind);
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: TimelineItem) => {
    setDialogMode('edit');
    setDialogKind(item.itemKind);
    setEditingItem(item);
    setDialogOpen(true);
  };

  const persistTimeline = async (path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: unknown) => {
    if (!projectId) {
      throw new Error('Project id is missing');
    }
    const token = await getAccessToken();
    if (!token) {
      throw new Error('Missing session token');
    }
    const nextData = (await crmRequest(path, {
      token,
      orgId: resolvedOrgId,
      method,
      body,
    })) as ProjectTimelineResponse;
    setData(nextData);
    setSelectedItemId((current) =>
      nextData.items.some((item) => item.id === current) ? current : nextData.items[0]?.id || null,
    );
  };

  const handleSaveItem = async (payload: any) => {
    try {
      setSaving(true);
      setInfo('');
      if (!projectId) {
        throw new Error('Project id is missing');
      }

      if (dialogMode === 'create') {
        await persistTimeline(`/api/projects/${projectId}/timeline/items`, 'POST', payload);
        setInfo('Timeline item created.');
      } else if (editingItem) {
        await persistTimeline(`/api/timeline/items/${editingItem.id}`, 'PATCH', payload);
        setSelectedItemId(editingItem.id);
        setInfo('Timeline item updated.');
      }

      setDialogOpen(false);
    } catch (saveError: any) {
      setError(saveError?.message || 'Failed to save timeline item');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (item: TimelineItem) => {
    try {
      setSaving(true);
      setInfo('');
      await persistTimeline(`/api/timeline/items/${item.id}`, 'DELETE');
      setSelectedItemId((current) => (current === item.id ? null : current));
      setInfo('Timeline item deleted.');
    } catch (deleteError: any) {
      setError(deleteError?.message || 'Failed to delete timeline item');
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbItems = React.useMemo(
    () => [
      { to: '/', title: 'Home' },
      { to: '/apps/projects', title: 'Projects' },
      { to: projectId ? `/apps/projects/${projectId}` : '/apps/projects', title: data?.project.name || 'Project Detail' },
      { title: 'Timeline' },
    ],
    [data?.project.name, projectId],
  );

  return (
    <PageContainer title="Project Timeline" description="Project timeline workspace">
      <Breadcrumb title="Project Timeline" items={breadcrumbItems} />

      <BlankCard sx={{ p: 3 }}>
        {loading ? <LinearProgress sx={{ mb: 2 }} /> : null}
        {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
        {info ? <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert> : null}

        {data ? (
          <Stack spacing={3}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              justifyContent="space-between"
              spacing={2}
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box>
                <Typography variant="h3">{data.project.name}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                  {data.project.code ? `${data.project.code} · ` : ''}
                  {data.project.projectType?.name || 'No project type'} · {data.project.status}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Button variant="outlined" onClick={() => navigate(`/apps/projects/${projectId}`)}>
                  Back to Project
                </Button>
                <Button variant="outlined" onClick={() => scrollToToday()}>
                  Today
                </Button>
                {data.permissions.canContribute ? (
                  <Button variant="outlined" onClick={() => openCreateDialog('update')}>
                    Add Update
                  </Button>
                ) : null}
                {data.permissions.canManage ? (
                  <>
                    <Button variant="outlined" onClick={() => openCreateDialog('milestone')}>
                      Add Milestone
                    </Button>
                    <Button variant="contained" onClick={() => openCreateDialog('phase')}>
                      Add Phase
                    </Button>
                  </>
                ) : null}
              </Stack>
            </Stack>

            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(97,93,255,0.08), rgba(57,182,154,0.08))',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle1" fontWeight={700}>
                Timeline Overview
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                Tap a phase, milestone, or update to open bullet-point notes. The milestone strip at the bottom stays synced with the main rail.
              </Typography>
            </Box>

            <TimelineRail
              items={data.items}
              window={data.window}
              selectedItemId={selectedItemId}
              onSelect={(item) => setSelectedItemId(item.id)}
            />

            <Box>
              <Typography variant="h5" sx={{ mb: 1.5 }}>
                Milestones
              </Typography>
              <MilestoneCarousel
                milestones={data.milestones}
                selectedItemId={selectedItemId}
                onSelect={(milestoneId) => setSelectedItemId(milestoneId)}
              />
            </Box>
          </Stack>
        ) : null}
      </BlankCard>

      <TimelineDetailDrawer
        item={selectedItem}
        open={Boolean(selectedItem)}
        onClose={() => setSelectedItemId(null)}
        onEdit={selectedItem && canEditSelectedItem ? () => openEditDialog(selectedItem) : undefined}
        onDelete={selectedItem && data?.permissions.canManage ? () => handleDeleteItem(selectedItem) : undefined}
        canManage={Boolean(data?.permissions.canManage)}
      />

      {data ? (
        <TimelineItemDialog
          open={dialogOpen}
          mode={dialogMode}
          item={editingItem}
          defaultKind={dialogKind}
          categories={data.categories}
          members={data.members}
          teams={data.teams}
          availableLinks={data.availableLinks}
          canManage={Boolean(data.permissions.canManage)}
          saving={saving}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveItem}
        />
      ) : null}
    </PageContainer>
  );
};

export default ProjectTimeline;
