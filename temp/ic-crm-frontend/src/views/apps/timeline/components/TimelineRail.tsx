import React from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import { hexToRgba, resolveUiColor } from 'src/lib/projectTypeColors';
import { TimelineItem, TimelineWindow } from 'src/types/timeline';
import {
  buildTimelineStack,
  buildMonthBands,
  buildTimelineTicks,
  formatTimelineDateRange,
  getLocalTimelineDateString,
  getPositionPercent,
  getWidthPercent,
} from '../timelineUtils';

type TimelineRailProps = {
  items: TimelineItem[];
  window: TimelineWindow;
  selectedItemId: string | null;
  onSelect: (item: TimelineItem) => void;
};

const laneOrder: Array<{ key: TimelineItem['itemKind']; label: string }> = [
  { key: 'phase', label: 'Phases' },
  { key: 'milestone', label: 'Milestones' },
  { key: 'update', label: 'Updates' },
];

const TimelineRail = ({ items, window, selectedItemId, onSelect }: TimelineRailProps) => {
  const monthBands = React.useMemo(() => buildMonthBands(window, items), [items, window]);
  const ticks = React.useMemo(() => buildTimelineTicks(window, items), [items, window]);
  const todayPosition = React.useMemo(
    () => getPositionPercent(window, items, getLocalTimelineDateString()),
    [items, window],
  );
  const minWidth = Math.max(1100, ticks.length * 120);

  const datedItems = items.filter((item) => item.startDate || item.endDate);
  const unscheduledItems = items.filter((item) => !item.startDate && !item.endDate);

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          overflowX: 'auto',
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'background.paper',
        }}
      >
        <Box sx={{ minWidth, p: 2.5 }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '180px 1fr',
              alignItems: 'stretch',
            }}
          >
            <Box />
            <Box sx={{ position: 'relative', mb: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {monthBands.map((band) => (
                  <Box
                    key={band.id}
                    sx={{
                      flex: 1,
                      py: 1,
                      px: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(90deg, rgba(97,93,255,0.10), rgba(57,182,154,0.08))',
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      {band.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ display: 'flex', mt: 1.5 }}>
                {ticks.map((tick) => (
                  <Box key={tick.id} sx={{ flex: 1, px: 0.75 }}>
                    <Typography variant="caption" color="text.secondary">
                      {tick.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>

          {laneOrder.map((lane) => {
            const laneItems = datedItems.filter((item) => item.itemKind === lane.key);
            const stack = buildTimelineStack(laneItems);
            const rowHeight = lane.key === 'milestone' ? 34 : 48;
            const topPadding = 18;
            const bottomPadding = 18;
            const laneHeight = topPadding + stack.rowCount * rowHeight + bottomPadding;

            return (
              <Box
                key={lane.key}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '180px 1fr',
                  gap: 2,
                  alignItems: 'stretch',
                  mb: 2,
                }}
              >
                <Box sx={{ pt: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {lane.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {laneItems.length} item{laneItems.length === 1 ? '' : 's'}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    position: 'relative',
                    minHeight: laneHeight,
                    borderRadius: 2.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    background:
                      'linear-gradient(180deg, rgba(248,250,252,0.95), rgba(241,245,249,0.82))',
                    overflow: 'hidden',
                  }}
                >
                  {todayPosition !== null ? (
                    <Box
                      id="timeline-today-marker"
                      sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${todayPosition}%`,
                        width: 2,
                        bgcolor: 'warning.main',
                        zIndex: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          position: 'absolute',
                          top: 6,
                          left: 8,
                          px: 0.75,
                          py: 0.25,
                          borderRadius: 999,
                          backgroundColor: 'warning.main',
                          color: 'common.white',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Today
                      </Typography>
                    </Box>
                  ) : null}

                  {ticks.map((tick) => (
                    <Box
                      key={`${lane.key}-${tick.id}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${getPositionPercent(window, items, tick.date.toISOString()) ?? 0}%`,
                        width: 1,
                        bgcolor: 'divider',
                        opacity: 0.5,
                      }}
                    />
                  ))}

                  {Array.from({ length: stack.rowCount }).map((_, rowIndex) => (
                    <Box
                      key={`${lane.key}-row-${rowIndex}`}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: topPadding + rowIndex * rowHeight,
                        height: rowHeight,
                        backgroundColor:
                          rowIndex % 2 === 0 ? 'rgba(255,255,255,0.26)' : 'rgba(255,255,255,0.08)',
                      }}
                    />
                  ))}

                  {laneItems.map((item) => {
                    const left = getPositionPercent(window, items, item.startDate || item.endDate);
                    const width =
                      item.itemKind === 'milestone'
                        ? 2.6
                        : getWidthPercent(window, items, item.startDate, item.endDate) ?? 8;

                    if (left === null) {
                      return null;
                    }

                    const accent = resolveUiColor(item.category?.color || '#615dff');
                    const isSelected = item.id === selectedItemId;
                    const placement = stack.placements.get(item.id);
                    const row = placement?.row || 0;
                    const top = topPadding + row * rowHeight + (lane.key === 'milestone' ? 7 : 5);

                    if (item.itemKind === 'milestone') {
                      return (
                        <Box
                          key={item.id}
                          id={`timeline-item-${item.id}`}
                          onClick={() => onSelect(item)}
                          sx={{
                            position: 'absolute',
                            left: `calc(${left}% - 8px)`,
                            top,
                            width: 20,
                            height: 20,
                            transform: 'rotate(45deg)',
                            borderRadius: 1,
                            bgcolor: accent,
                            border: '2px solid',
                            borderColor: isSelected ? 'common.black' : 'common.white',
                            boxShadow: isSelected ? '0 0 0 3px rgba(15,23,42,0.12)' : '0 8px 18px rgba(15,23,42,0.12)',
                            cursor: 'pointer',
                          }}
                        />
                      );
                    }

                    return (
                      <Box
                        key={item.id}
                        id={`timeline-item-${item.id}`}
                        onClick={() => onSelect(item)}
                        sx={{
                          position: 'absolute',
                          left: `${left}%`,
                          top,
                          width: `${width}%`,
                          minWidth: 110,
                          px: 1.75,
                          py: 1.05,
                          borderRadius: 999,
                          bgcolor: isSelected ? hexToRgba(accent, 0.14) : 'rgba(255,255,255,0.94)',
                          color: 'text.primary',
                          border: '1px solid',
                          borderColor: isSelected ? accent : hexToRgba(accent, 0.42),
                          boxShadow: isSelected
                            ? `0 0 0 3px ${hexToRgba(accent, 0.14)}`
                            : '0 10px 20px rgba(15,23,42,0.06)',
                          cursor: 'pointer',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            width: 6,
                            backgroundColor: accent,
                          },
                        }}
                      >
                        <Typography variant="body2" fontWeight={700} noWrap sx={{ pl: 0.5 }}>
                          {item.title}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>

      {unscheduledItems.length ? (
        <Box
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Unscheduled Items
          </Typography>
          <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
            {unscheduledItems.map((item) => (
              <Chip
                key={item.id}
                label={`${item.title} · ${formatTimelineDateRange(item.startDate, item.endDate)}`}
                onClick={() => onSelect(item)}
                sx={{ borderRadius: 2 }}
              />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Stack>
  );
};

export default TimelineRail;
