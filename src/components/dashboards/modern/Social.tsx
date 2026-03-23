// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import React from 'react';
import { Link } from 'react-router';
import { Stack, Typography, Avatar, Box, AvatarGroup } from '@mui/material';
import { IconMessage2 } from '@tabler/icons-react';

import DashboardCard from '../../shared/DashboardCard';
import { SocialWidgetData } from 'src/views/dashboard/useModernDashboardData';

type SocialProps = {
  data: SocialWidgetData;
};

const avatarForName = (name: string) =>
  `https://ui-avatars.com/api/?background=1976d2&color=fff&name=${encodeURIComponent(name)}`;

const Social = ({ data }: SocialProps) => {
  const primaryParticipant = data.participants[0]?.name || 'Team';
  return (
    <DashboardCard>
      <>
        <Stack direction="row" spacing={2}>
          <Avatar
            src={avatarForName(primaryParticipant)}
            alt={primaryParticipant}
            sx={{ borderRadius: '8px', width: 70, height: 70 }}
          />
          <Box>
            <Typography variant="h5">{data.title}</Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {data.dateLabel}
            </Typography>
          </Box>
        </Stack>
        <Stack direction="row" justifyContent="space-between" mt={5}>
          <AvatarGroup max={4}>
            {data.participants.map((participant) => (
              <Avatar
                key={participant.name}
                alt={participant.name}
                src={avatarForName(participant.name)}
              />
            ))}
          </AvatarGroup>
          <Link to="/">
            <Box
              width="40px"
              height="40px"
              bgcolor="primary.light"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography
                color="primary.main"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <IconMessage2 width={22} />
              </Typography>
            </Box>
          </Link>
        </Stack>
      </>
    </DashboardCard>
  );
};

export default Social;
