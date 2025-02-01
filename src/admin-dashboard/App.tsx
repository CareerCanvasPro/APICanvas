import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { theme } from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Roles from './pages/Roles';
import Templates from './pages/Templates';
import Analytics from './pages/Analytics';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/roles" element={<Roles />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;