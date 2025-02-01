import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Tooltip
} from '@mui/material';
import { Refresh, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useRealTimeData } from '../../hooks/useRealTimeData';
import { useApi } from '../../hooks/useApi';
import { fetchDashboardStats, fetchSystemPerformance } from '../../api/admin';
import { LineChart } from './charts/LineChart';
import { MetricsCard } from './cards/MetricsCard';
import { ActivityFeed } from './feeds/ActivityFeed';

export const Dashboard: React.FC = () => {
  const { data: stats, loading: statsLoading, execute: refreshStats } = useApi(fetchDashboardStats);
  const { data: realtimeMetrics } = useRealTimeData({
    endpoint: process.env.REACT_APP_WS_URL || 'ws://localhost:3001',
    event: 'system-metrics'
  });

  const renderTrend = (value: number) => {
    const isPositive = value >= 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', color: isPositive ? 'success.main' : 'error.main' }}>
        {isPositive ? <TrendingUp /> : <TrendingDown />}
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {Math.abs(value)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Dashboard</Typography>
        <Tooltip title="Refresh Data">
          <IconButton onClick={() => refreshStats()}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Key Metrics */}
        <Grid item xs={12} md={4}>
          <MetricsCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            trend={stats?.usersTrend}
            loading={statsLoading}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricsCard
            title="Active Sessions"
            value={realtimeMetrics?.activeSessions || 0}
            trend={realtimeMetrics?.sessionsTrend}
            loading={false}
            realtime
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <MetricsCard
            title="System Health"
            value={stats?.systemHealth?.status || 'Unknown'}
            trend={null}
            loading={statsLoading}
            variant="status"
          />
        </Grid>

        {/* Performance Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <CardHeader 
              title="System Performance"
              action={
                <Typography variant="caption" color="textSecondary">
                  Real-time updates
                </Typography>
              }
            />
            <CardContent>
              <LineChart
                data={realtimeMetrics?.performanceData || []}
                height={300}
              />
            </CardContent>
          </Paper>
        </Grid>

        {/* Activity Feed */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <CardHeader title="Recent Activity" />
            <CardContent>
              <ActivityFeed
                activities={realtimeMetrics?.recentActivities || []}
                loading={statsLoading}
              />
            </CardContent>
          </Paper>
        </Grid>

        {/* System Resources */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <CardHeader title="System Resources" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <MetricsCard
                    title="CPU Usage"
                    value={realtimeMetrics?.cpu || 0}
                    suffix="%"
                    variant="percentage"
                    realtime
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricsCard
                    title="Memory Usage"
                    value={realtimeMetrics?.memory || 0}
                    suffix="GB"
                    variant="memory"
                    realtime
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricsCard
                    title="Response Time"
                    value={realtimeMetrics?.responseTime || 0}
                    suffix="ms"
                    variant="time"
                    realtime
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <MetricsCard
                    title="Error Rate"
                    value={realtimeMetrics?.errorRate || 0}
                    suffix="%"
                    variant="error"
                    realtime
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};