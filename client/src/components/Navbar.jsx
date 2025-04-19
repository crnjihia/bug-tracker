import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
} from '@mui/material';
import { BugReport, Menu as MenuIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileAnchorEl, setMobileAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar position='static' elevation={0}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Left side - Logo/Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BugReport sx={{ mr: 1 }} />
          <Typography
            variant='h6'
            component={RouterLink}
            to='/'
            sx={{
              textDecoration: 'none',
              color: 'inherit',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            Bug Tracker
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
          {user ? (
            <>
              <Button component={RouterLink} to='/' color='inherit' sx={{ textTransform: 'none' }}>
                Dashboard
              </Button>
              <Tooltip title='Account settings'>
                <IconButton onClick={handleProfileMenuOpen} size='small' sx={{ ml: 2 }}>
                  <Avatar sx={{ width: 32, height: 32 }}>
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to='/login'
                color='inherit'
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <Button
                component={RouterLink}
                to='/register'
                color='inherit'
                sx={{ textTransform: 'none' }}
              >
                Register
              </Button>
            </>
          )}
        </Box>

        {/* Mobile Navigation */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton size='large' edge='end' color='inherit' onClick={handleMobileMenuOpen}>
            <MenuIcon />
          </IconButton>
        </Box>

        {/* Mobile Menu */}
        <Menu anchorEl={mobileAnchorEl} open={Boolean(mobileAnchorEl)} onClose={handleMenuClose}>
          {user
            ? [
                <MenuItem key='dashboard' component={RouterLink} to='/'>
                  Dashboard
                </MenuItem>,
                <MenuItem key='profile' onClick={handleProfileMenuOpen}>
                  Profile
                </MenuItem>,
                <MenuItem key='logout' onClick={handleLogout}>
                  Logout
                </MenuItem>,
              ]
            : [
                <MenuItem key='login' component={RouterLink} to='/login'>
                  Login
                </MenuItem>,
                <MenuItem key='register' component={RouterLink} to='/register'>
                  Register
                </MenuItem>,
              ]}
        </Menu>

        {/* Profile Menu */}
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
          <MenuItem disabled>
            <Typography variant='subtitle1'>Hello, {user?.username}</Typography>
          </MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}
