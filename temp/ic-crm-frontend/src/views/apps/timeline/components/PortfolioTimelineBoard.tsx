import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { hexToRgba, resolveUiColor } from 'src/lib/projectTypeColors';
import { PortfolioTimelineItem, PortfolioTimelineLane, TimelineWindow } from 'src/types/timeline';
import {
  buildMonthBands,
  buildTimelineStack,
  buildTimelineTicks,
  getLocalTimelineDateString,
  getPositionPercent,
  getWidthPercent,
} from '../timelineUtils';

type PortfolioTimelineBoardProps = {
  lanes: PortfolioTimelineLane[];
  window: TimelineWindow;
  selectedItemId: string | null;
  onSelect: (item: PortfolioTimelineItem) => void;
};

const laneKinds: Array<{ key: PortfolioTimelineItem['itemKind']; label: string }> = [
  { key: 'phase', label: 'Phases' },
  { key: 'milestone', label: 'Milestones' },
  { key: 'update', label: 'Updates' },
];

const sortTimelineItems = (items: PortfolioTimelineItem[]) =>
  [...items].sort((left, right) => {
    const leftDate = new Date(left.startDate || left.endDate || '9999-12-31').getTime();
    const rightDate = new Date(right.startDate || right.endDate || '9999-12-31').getTime();
    if (leftDate !== rightDate) {
      return leftDate - rightDate;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.title.localeCompare(right.title);
  });

const PortfolioTimelineBoard = ({
  lanes,
  window,
  selectedItemId,
  onSelect,
}: PortfolioTimelineBoardProps) => {
  const allItems = React.useMemo(() => lanes.flatMap((lane) => lane.items), [lanes]);
  const monthBands = React.useMemo(() => buildMonthBands(window, allItems), [allItems, window]);
  const ticks = React.useMemo(() => buildTimelineTicks(window, allItems), [allItems, window]);
  const todayPosition = React.useMemo(
    () => getPositionPercent(window, allItems, getLocalTimelineDateString()),
    [allItems, window],
  );
  const minWidth = Math.max(1240, ticks.length * 120);
  const timelineLabelWidth = 92;

  return (
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
        <Box sx={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 2, mb: 2 }}>
          <Box />
          <Box sx={{ display: 'grid', gridTemplateColumns: `${timelineLabelWidth}px 1fr`, gap: 1.5 }}>
            <Box />
            <Box>
              <Stack direction="row" spacing={0.75}>
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
              </Stack>
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
        </Box>

        <Stack spacing={1.75}>
          {lanes.map((lane, laneIndex) => (
            <Box
              key={lane.id}
              sx={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr',
                gap: 2,
                alignItems: 'stretch',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  backgroundColor: lane.color ? hexToRgba(lane.color, 0.1) : 'grey.100',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Typography variant="subtitle1" fontWeight={700}>
                  {lane.title}
                </Typography>
                {lane.subtitle ? (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {lane.subtitle}
                  </Typography>
                ) : null}
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {lane.itemCount} scheduled item{lane.itemCount === 1 ? '' : 's'}
                </Typography>
              </Box>

              <Stack
                spacing={1.25}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(180deg, rgba(248,250,252,0.95), rgba(241,245,249,0.82))',
                }}
              >
                {laneKinds.map((laneKind, rowIndex) => {
                  const laneItems = sortTimelineItems(
                    lane.items.filter((item) => item.itemKind === laneKind.key),
                  );
                  const stack = buildTimelineStack(laneItems);
                  const rowHeight = laneKind.key === 'milestone' ? 34 : 48;
                  const topPadding = 12;
                  const bottomPadding = 12;
                  const railHeight = topPadding + stack.rowCount * rowHeight + bottomPadding;

                  return (
                    <Box
                      key={`${lane.id}-${laneKind.key}`}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: `${timelineLabelWidth}px 1fr`,
                        gap: 1.5,
                        alignItems: 'stretch',
                      }}
                    >
                      <Box sx={{ pt: 1 }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          {laneKind.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {laneItems.length} item{laneItems.length === 1 ? '' : 's'}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          position: 'relative',
                          minHeight: railHeight,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          backgroundColor: 'rgba(255,255,255,0.52)',
                          overflow: 'hidden',
                        }}
                      >
                        {todayPosition !== null ? (
                          <Box
                            id={laneIndex === 0 && rowIndex === 0 ? 'portfolio-today-marker' : undefined}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: `${todayPosition}%`,
                              width: 2,
                              bgcolor: 'warning.main',
                              zIndex: 1,
                            }}
                          />
                        ) : null}

                        {ticks.map((tick) => (
                          <Box
                            key={`${lane.id}-${laneKind.key}-${tick.id}`}
                            sx={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: `${getPositionPercent(window, allItems, tick.date.toISOString()) ?? 0}%`,
                              width: 1,
                              bgcolor: 'divider',
                              opacity: 0.42,
                            }}
                          />
                        ))}

                        {Array.from({ length: stack.rowCount }).map((_, stackIndex) => (
                          <Box
                            key={`${lane.id}-${laneKind.key}-row-${stackIndex}`}
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              top: topPadding + stackIndex * rowHeight,
                              height: rowHeight,
                              backgroundColor:
                                stackIndex % 2 === 0
                                  ? 'rgba(255,255,255,0.22)'
                                  : 'rgba(255,255,255,0.06)',
                            }}
                          />
                        ))}

                        {laneItems.map((item) => {
                          const left = getPositionPercent(window, allItems, item.startDate || item.endDate);
                          if (left === null) {
                            return null;
                          }

                          const width =
                            item.itemKind === 'milestone'
                              ? 2.6
                              : getWidthPercent(window, allItems, item.startDate, item.endDate) ?? 8;
                          const accent = resolveUiColor(item.category?.color || lane.color || '#615dff');
                          const isSelected = selectedItemId === item.id;
                          const row = stack.placements.get(item.id)?.row || 0;
                          const top = topPadding + row * rowHeight + (laneKind.key === 'milestone' ? 7 : 5);

                          if (item.itemKind === 'milestone') {
                            return (
                              <Box
                                key={item.id}
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
                                  boxShadow: isSelected
                                    ? '0 0 0 3px rgba(15,23,42,0.12)'
                                    : '0 8px 18px rgba(15,23,42,0.12)',
                                  cursor: 'pointer',
                                }}
                              />
                            );
                          }

                          return (
                            <Box
                              key={item.id}
                              onClick={() => onSelect(item)}
                              sx={{
                                position: 'absolute',
                                left: `${left}%`,
                                top,
                                width: `${width}%`,
                                minWidth: 138,
                                px: 1.75,
                                py: 1.05,
                                borderRadius: 999,
                                bgcolor: isSelected ? hexToRgba(accent, 0.14) : 'rgba(255,255,255,0.95)',
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
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default PortfolioTimelineBoard;
