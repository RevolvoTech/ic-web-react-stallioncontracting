import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  Link,
  Stack,
  Typography,
  useMediaQuery,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTheme } from '@mui/material/styles';
import { getReadableTextColor, hexToRgba, resolveUiColor } from 'src/lib/projectTypeColors';
import { TimelineItem } from 'src/types/timeline';
import { formatTimelineDateRange } from '../timelineUtils';

type TimelineDetailDrawerProps = {
  item: TimelineItem | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (item: TimelineItem) => void;
  onDelete?: (item: TimelineItem) => void;
  canManage?: boolean;
};

const TimelineDetailDrawer = ({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
  canManage = false,
}: TimelineDetailDrawerProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  if (!item) {
    return null;
  }

  const accent = resolveUiColor(item.category?.color || '#615dff');

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'right'}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 460,
          maxHeight: isMobile ? '86vh' : '100%',
          borderTopLeftRadius: isMobile ? 24 : 0,
          borderTopRightRadius: isMobile ? 24 : 0,
        },
      }}
    >
      <Stack spacing={2.5} sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" spacing={2} alignItems="flex-start">
          <Box>
            <Typography variant="h4" gutterBottom>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {formatTimelineDateRange(item.startDate, item.endDate)}
            </Typography>
          </Box>
          <Chip
            label={item.itemKind}
            sx={{
              textTransform: 'capitalize',
              backgroundColor: hexToRgba(accent, 0.16),
              color: getReadableTextColor(accent),
              border: `1px solid ${accent}`,
            }}
          />
        </Stack>

        {item.summary ? (
          <Typography variant="body1" color="text.secondary">
            {item.summary}
          </Typography>
        ) : null}

        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          <Chip size="small" label={`Status: ${item.status}`} sx={{ textTransform: 'capitalize' }} />
          {item.category ? <Chip size="small" label={item.category.name} /> : null}
          {item.assignedTeam ? <Chip size="small" label={`Team: ${item.assignedTeam.name}`} /> : null}
          {item.assignedUser ? <Chip size="small" label={`Owner: ${item.assignedUser.fullName}`} /> : null}
        </Stack>

        <Divider />

        <Box>
          <Typography variant="h6" gutterBottom>
            Notes
          </Typography>
          {item.points.length ? (
            <Stack spacing={1.25}>
              {item.points.map((point) => (
                <Accordion key={point.id} disableGutters sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography fontWeight={600}>{point.title}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" color="text.secondary">
                      {point.detail || 'No additional detail yet.'}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No notes added yet.
            </Typography>
          )}
        </Box>

        <Divider />

        <Box>
          <Typography variant="h6" gutterBottom>
            Related Records
          </Typography>
          {item.links.length ? (
            <Stack spacing={1.25}>
              {item.links.map((linkItem) => (
                <Box
                  key={linkItem.id}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: linkItem.record.missing ? 'warning.lighter' : 'background.paper',
                  }}
                >
                  <Typography fontWeight={700}>{linkItem.record.title}</Typography>
                  {linkItem.record.subtitle ? (
                    <Typography variant="body2" color="text.secondary">
                      {linkItem.record.subtitle}
                    </Typography>
                  ) : null}
                  {linkItem.record.detail ? (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {linkItem.record.detail}
                    </Typography>
                  ) : null}
                  {linkItem.record.url ? (
                    <Link href={linkItem.record.url} underline="hover" sx={{ mt: 0.75, display: 'inline-block' }}>
                      Open linked item
                    </Link>
                  ) : null}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No related records linked yet.
            </Typography>
          )}
        </Box>

        {(canManage || onEdit) && (
          <>
            <Divider />
            <Stack direction="row" spacing={1.25}>
              {onEdit ? (
                <Button variant="contained" onClick={() => onEdit(item)}>
                  Edit Item
                </Button>
              ) : null}
              {canManage && onDelete ? (
                <Button color="error" variant="outlined" onClick={() => onDelete(item)}>
                  Delete
                </Button>
              ) : null}
            </Stack>
          </>
        )}
      </Stack>
    </Drawer>
  );
};

export default TimelineDetailDrawer;
