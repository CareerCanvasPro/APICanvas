import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import { useErrorAnalytics } from '../../../hooks/useErrorAnalytics';
import { ErrorRateChart } from './ErrorRateChart';
import { ErrorTypeDistribution } from './ErrorTypeDistribution';
import { ErrorTimeline } from './ErrorTimeline';
import { ComponentErrorHeatmap } from './ComponentErrorHeatmap';

export const ErrorAnalyticsView: React.FC = () => {
  const { metrics, errorRate } = useErrorAnalytics();

  if (!metrics) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Rate
          </Typography>
          <ErrorRateChart
            data={metrics.errorTimeline}
            currentRate={errorRate}
          />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Distribution by Type
          </Typography>
          <ErrorTypeDistribution data={metrics.errorsByType} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Error Timeline
          </Typography>
          <ErrorTimeline data={metrics.errorTimeline} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Component Error Heatmap
          </Typography>
          <ComponentErrorHeatmap data={metrics.errorsByComponent} />
        </Paper>
      </Grid>
    </Grid>
  );
};