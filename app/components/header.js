'use client'
import { useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Box } from '@mui/material';
import { useAuth } from '../providers/AuthProvider';
import { useRouter } from 'next/navigation';
import SettingsIcon from '@mui/icons-material/Settings';
import StarIcon from '@mui/icons-material/Star';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Header({ toggleDrawer }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    try {
      await logout(); // Use the logout function from AuthProvider
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
    handleMenuClose();
  };

  const handleSettings = () => {
    router.push('/settings');
    handleMenuClose();
  };

  const handleUpgradePlan = () => {
    router.push('/upgrade-plan');
    handleMenuClose();
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
      {user && (
        <>
          <IconButton onClick={handleMenuOpen}>
            <Avatar src={user.photoURL} alt={user.displayName} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleSettings}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Settings</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleUpgradePlan}>
              <ListItemIcon>
                <StarIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Upgrade Plan</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleSignOut}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Log out</ListItemText>
            </MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}