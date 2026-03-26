import { addDays, differenceInCalendarDays, eachWeekOfInterval, endOfMonth, format, isValid, max, min, parseISO, startOfMonth } from 'date-fns';
import { PortfolioTimelineItem, TimelineItem, TimelineWindow } from 'src/types/timeline';

const parseDate = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
};

const getItemBounds = <T extends { startDate?: string | null; endDate?: string | null }>(item: T) => {
  const start = parseDate(item.startDate || item.endDate);
  const end = parseDate(item.endDate || item.startDate);
  if (!start || !end) {
    return null;
  }
  return { start, end };
};

const getItemKindWeight = (itemKind?: string | null) => {
  if (itemKind === 'phase') {
    return 0;
  }
  if (itemKind === 'update') {
    return 1;
  }
  return 2;
};

export const getLocalTimelineDateString = (date = new Date()) => {
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10);
};

export const clampTimelineWindow = (window: TimelineWindow) => {
  const start = parseDate(window.startDate) || new Date();
  const end = parseDate(window.endDate) || addDays(start, 30);
  if (end < start) {
    return { start, end: addDays(start, 30) };
  }
  return { start, end };
};

export const extendWindowForItems = (window: TimelineWindow, items: Array<TimelineItem | PortfolioTimelineItem>) => {
  const base = clampTimelineWindow(window);
  const datedItems = items
    .flatMap((item) => [parseDate(item.startDate), parseDate(item.endDate)])
    .filter((value): value is Date => Boolean(value));

  if (!datedItems.length) {
    return base;
  }

  return {
    start: min([base.start, ...datedItems]),
    end: max([base.end, ...datedItems]),
  };
};

export const getTimelineRangeDays = (window: TimelineWindow, items: Array<TimelineItem | PortfolioTimelineItem>) => {
  const normalized = extendWindowForItems(window, items);
  return {
    ...normalized,
    totalDays: Math.max(1, differenceInCalendarDays(normalized.end, normalized.start) + 1),
  };
};

export const buildTimelineTicks = (window: TimelineWindow, items: Array<TimelineItem | PortfolioTimelineItem>) => {
  const normalized = extendWindowForItems(window, items);
  return eachWeekOfInterval({ start: normalized.start, end: normalized.end }, { weekStartsOn: 1 }).map((week) => ({
    id: week.toISOString(),
    date: week,
    label: format(week, 'MMM d'),
    monthLabel: format(startOfMonth(week), 'MMM yyyy'),
  }));
};

export const buildMonthBands = (window: TimelineWindow, items: Array<TimelineItem | PortfolioTimelineItem>) => {
  const normalized = extendWindowForItems(window, items);
  const months: Array<{ id: string; label: string; start: Date; end: Date }> = [];
  let cursor = startOfMonth(normalized.start);

  while (cursor <= normalized.end) {
    const monthEnd = endOfMonth(cursor);
    months.push({
      id: cursor.toISOString(),
      label: format(cursor, 'MMMM yyyy'),
      start: cursor,
      end: monthEnd,
    });
    cursor = addDays(monthEnd, 1);
  }

  return months;
};

export const getPositionPercent = (window: TimelineWindow, items: Array<TimelineItem | PortfolioTimelineItem>, dateValue?: string | null) => {
  const date = parseDate(dateValue);
  if (!date) {
    return null;
  }

  const normalized = getTimelineRangeDays(window, items);
  const offset = differenceInCalendarDays(date, normalized.start);
  return Math.min(100, Math.max(0, (offset / normalized.totalDays) * 100));
};

export const getWidthPercent = (
  window: TimelineWindow,
  items: Array<TimelineItem | PortfolioTimelineItem>,
  startDate?: string | null,
  endDate?: string | null,
) => {
  const start = parseDate(startDate);
  const end = parseDate(endDate || startDate);
  if (!start || !end) {
    return null;
  }

  const normalized = getTimelineRangeDays(window, items);
  const span = Math.max(1, differenceInCalendarDays(end, start) + 1);
  return Math.min(100, Math.max((span / normalized.totalDays) * 100, 1.25));
};

export const formatTimelineDate = (value?: string | null) => {
  const parsed = parseDate(value);
  if (!parsed) {
    return 'Unscheduled';
  }
  return format(parsed, 'MMM d, yyyy');
};

export const formatTimelineDateRange = (startDate?: string | null, endDate?: string | null) => {
  if (!startDate && !endDate) {
    return 'Unscheduled';
  }
  if (startDate && endDate && startDate !== endDate) {
    return `${formatTimelineDate(startDate)} - ${formatTimelineDate(endDate)}`;
  }
  return formatTimelineDate(startDate || endDate);
};

export const buildTimelineStack = <
  T extends {
    id: string;
    startDate?: string | null;
    endDate?: string | null;
    sortOrder?: number | null;
    itemKind?: string | null;
  },
>(
  items: T[],
) => {
  const placements = new Map<
    string,
    {
      row: number;
      start: Date;
      end: Date;
    }
  >();

  const scheduledItems = items
    .map((item) => {
      const bounds = getItemBounds(item);
      if (!bounds) {
        return null;
      }
      return {
        item,
        ...bounds,
      };
    })
    .filter((value): value is { item: T; start: Date; end: Date } => Boolean(value))
    .sort((left, right) => {
      const startDiff = left.start.getTime() - right.start.getTime();
      if (startDiff !== 0) {
        return startDiff;
      }

      const leftDuration = left.end.getTime() - left.start.getTime();
      const rightDuration = right.end.getTime() - right.start.getTime();
      if (leftDuration !== rightDuration) {
        return rightDuration - leftDuration;
      }

      const kindDiff = getItemKindWeight(left.item.itemKind) - getItemKindWeight(right.item.itemKind);
      if (kindDiff !== 0) {
        return kindDiff;
      }

      return Number(left.item.sortOrder || 0) - Number(right.item.sortOrder || 0);
    });

  const rowEndTimes: number[] = [];

  scheduledItems.forEach(({ item, start, end }) => {
    const startTime = start.getTime();
    const endTime = end.getTime();

    let row = rowEndTimes.findIndex((rowEndTime) => startTime > rowEndTime);
    if (row === -1) {
      row = rowEndTimes.length;
    }

    rowEndTimes[row] = endTime;
    placements.set(item.id, { row, start, end });
  });

  return {
    placements,
    rowCount: Math.max(rowEndTimes.length, 1),
  };
};
