import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  CircularProgress
} from '@mui/material';
import { TaskMetricsChart } from './TaskMetricsChart';
import { TaskTimeline } from './TaskTimeline';
import { BlockersList } from './BlockersList';
import { useTaskAnalytics } from '../hooks/useTaskAnalytics';

interface TaskAnalyticsViewProps {
  taskId: string;
}

export const TaskAnalyticsView: React.FC<TaskAnalyticsViewProps> = ({ taskId }) => {
  const { metrics, timeline, loading } = useTaskAnalytics(taskId);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Task Progress Metrics
          </Typography>
          <TaskMetricsChart metrics={metrics} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Completion Summary
          </Typography>
          <Typography variant="h3" color="primary">
            {(metrics.completionRate * 100).toFixed(1)}%
          </Typography>
          {metrics.estimatedCompletion && (
            <Typography color="textSecondary">
              Estimated completion: {metrics.estimatedCompletion.toLocaleDateString()}
            </Typography>
          )}
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Task Timeline
          </Typography>
          <TaskTimeline events={timeline} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Active Blockers ({metrics.blockerCount})
          </Typography>
          <BlockersList taskId={taskId} />
        </Paper>
      </Grid>
    </Grid>
  );
};