import { Box, Avatar, Typography, IconButton, Tooltip, useMediaQuery } from '@mui/material';

import { IconPower } from '@tabler/icons-react';
import { CustomizerContext } from 'src/context/CustomizerContext';
import { useContext } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from 'src/context/AuthContext';

export const Profile = () => {
  const { isSidebarHover, isCollapse } = useContext(CustomizerContext);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up('lg'));
  const hideMenu = lgUp ? isCollapse == 'mini-sidebar' && !isSidebarHover : '';

  const displayName =
    `${profile?.user.firstName || ''} ${profile?.user.lastName || ''}`.trim() || profile?.user.email || 'User';
  const roleLabel = profile?.user.globalRole
    ? `Global ${profile.user.globalRole}`
    : profile?.activeOrg.orgRole || 'Member';
  const avatarUrl =
    profile?.user.avatarUrl ||
    `https://ui-avatars.com/api/?background=1976d2&color=fff&name=${encodeURIComponent(displayName)}`;

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate('/auth/login');
    }
  };

  return (
    <Box
      display={'flex'}
      alignItems="center"
      gap={2}
      sx={{ m: 3, p: 2, bgcolor: `${'secondary.light'}` }}
    >
      {!hideMenu ? (
        <>
          <Avatar alt={displayName} src={avatarUrl} />

          <Box>
            <Typography variant="h6">{displayName}</Typography>
            <Typography variant="caption">{roleLabel}</Typography>
          </Box>
          <Box sx={{ ml: 'auto' }}>
            <Tooltip title="Logout" placement="top">
              <IconButton color="primary" aria-label="logout" size="small" onClick={handleLogout}>
                <IconPower size="20" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : (
        ''
      )}
    </Box>
  );
};
