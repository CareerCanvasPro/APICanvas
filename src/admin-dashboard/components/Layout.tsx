import React from 'react';
import { Box, AppBar, Toolbar, Drawer, List, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigationMenu from './NavigationMenu';

const drawerWidth = 240;

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: drawerWidth,
  marginTop: 64
}));

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: theme => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            CareerCanvas Admin
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <NavigationMenu />
        </Box>
      </Drawer>
      <Main>{children}</Main>
    </Box>
  );
};

export default Layout;