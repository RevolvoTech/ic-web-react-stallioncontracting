import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { hexToRgba, resolveUiColor } from 'src/lib/projectTypeColors';
import { TimelineMilestoneCard } from 'src/types/timeline';
import { formatTimelineDate } from '../timelineUtils';

type MilestoneCarouselProps = {
  milestones: TimelineMilestoneCard[];
  selectedItemId: string | null;
  onSelect: (milestoneId: string) => void;
};

const MilestoneCarousel = ({ milestones, selectedItemId, onSelect }: MilestoneCarouselProps) => {
  const settings = React.useMemo(
    () => ({
      dots: false,
      arrows: false,
      infinite: false,
      slidesToShow: Math.min(3, Math.max(milestones.length, 1)),
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 1200,
          settings: { slidesToShow: Math.min(2, Math.max(milestones.length, 1)) },
        },
        {
          breakpoint: 768,
          settings: { slidesToShow: 1.1 },
        },
      ],
    }),
    [milestones.length],
  );

  if (!milestones.length) {
    return null;
  }

  return (
    <Box
      sx={{
        '& .slick-slide': {
          px: 1,
        },
      }}
    >
      <Slider {...settings}>
        {milestones.map((milestone) => {
          const accent = resolveUiColor(milestone.category?.color || '#615dff');
          const isSelected = milestone.id === selectedItemId;

          return (
            <Box key={milestone.id}>
              <Box
                onClick={() => onSelect(milestone.id)}
                sx={{
                  position: 'relative',
                  p: 2.25,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: isSelected ? accent : 'divider',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))',
                  color: 'text.primary',
                  cursor: 'pointer',
                  minHeight: 164,
                  overflow: 'hidden',
                  boxShadow: isSelected
                    ? `0 16px 32px ${hexToRgba(accent, 0.2)}`
                    : '0 10px 24px rgba(15,23,42,0.08)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 6,
                    backgroundColor: accent,
                  },
                }}
              >
                <Chip
                  size="small"
                  label={formatTimelineDate(milestone.date)}
                  sx={{
                    backgroundColor: hexToRgba(accent, 0.12),
                    color: accent,
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                />
                <Typography variant="h6" sx={{ mt: 1.25, mb: 1 }}>
                  {milestone.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 52 }}>
                  {milestone.summary || 'No summary added yet.'}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.75 }}>
                  <Chip
                    size="small"
                    label={milestone.status}
                    sx={{
                      textTransform: 'capitalize',
                      backgroundColor: hexToRgba(accent, 0.14),
                      color: accent,
                      fontWeight: 700,
                    }}
                  />
                  {milestone.category?.name ? (
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      {milestone.category.name}
                    </Typography>
                  ) : null}
                </Box>
              </Box>
            </Box>
          );
        })}
      </Slider>
    </Box>
  );
};

export default MilestoneCarousel;
