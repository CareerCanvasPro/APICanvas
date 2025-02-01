import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { useQuery } from 'react-query';
import { fetchDashboardStats } from '../api/admin';
import StatsCard from '../components/StatsCard';
import ActivityChart from '../components/ActivityChart';
import PerformanceMetrics from '../components/PerformanceMetrics';

const Dashboard = () => {
  const { data: stats, isLoading } = useQuery('dashboardStats', fetchDashboardStats);

  if (isLoading) return <div>Loading...</div>;

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          Dashboard Overview
        </Typography>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <StatsCard
          title="Total Users"
          value={stats?.totalUsers || 0}
          trend={stats?.usersTrend}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <StatsCard
          title="Active Templates"
          value={stats?.totalTemplates || 0}
          trend={stats?.templatesTrend}
        />
      </Grid>
      
      <Grid item xs={12} md={4}>
        <StatsCard
          title="System Health"
          value={stats?.systemHealth || 'Good'}
          trend={stats?.healthTrend}
        />
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <ActivityChart data={stats?.activityData} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <PerformanceMetrics data={stats?.performanceData} />
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;