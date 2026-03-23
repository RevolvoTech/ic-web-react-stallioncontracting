import React, { useState } from 'react';
import {
  Box,
  Menu,
  Avatar,
  Typography,
  Divider,
  Button,
  IconButton,
  Stack,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router';
import { useAuth } from 'src/context/AuthContext';

const Profile = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const open = Boolean(anchorEl);
  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const displayName =
    `${profile?.user.firstName || ''} ${profile?.user.lastName || ''}`.trim() || profile?.user.email || 'User';
  const avatarUrl =
    profile?.user.avatarUrl ||
    `https://ui-avatars.com/api/?background=1976d2&color=fff&name=${encodeURIComponent(displayName)}`;
  const roleLabel = profile?.user.globalRole
    ? `global ${profile.user.globalRole}`
    : profile?.activeOrg.orgRole || 'member';

  const handleLogout = async () => {
    try {
      await signOut();
    } finally {
      handleClose();
      navigate('/auth/login');
    }
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="profile menu"
        color="inherit"
        onClick={handleOpen}
        sx={{
          ...(open && {
            color: 'primary.main',
          }),
        }}
      >
        <Avatar
          src={avatarUrl}
          alt={displayName}
          sx={{
            width: 35,
            height: 35,
          }}
        />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        sx={{
          '& .MuiMenu-paper': {
            width: '320px',
            p: 3,
          },
        }}
      >
        <Typography variant="h5">Account</Typography>
        <Stack direction="row" py={3} spacing={2} alignItems="center">
          <Avatar src={avatarUrl} alt={displayName} sx={{ width: 72, height: 72 }} />
          <Box>
            <Typography variant="subtitle1" color="textPrimary" fontWeight={600}>
              {displayName}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary">
              {profile?.user.email}
            </Typography>
            <Box mt={1}>
              <Chip size="small" color="primary" label={roleLabel} />
            </Box>
          </Box>
        </Stack>
        <Divider />
        <Box mt={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => {
              handleClose();
              navigate('/apps/profile');
            }}
          >
            My Profile
          </Button>
        </Box>
        <Box mt={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            onClick={() => {
              handleClose();
              navigate('/apps/team');
            }}
          >
            Manage Team & Roles
          </Button>
        </Box>
        <Box mt={2}>
          <Button variant="contained" color="primary" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
