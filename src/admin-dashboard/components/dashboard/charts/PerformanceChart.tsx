import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { LineChart } from './LineChart';

interface PerformanceData {
  timestamp: string;
  cpu: number;
  memory: number;
  responseTime: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
  loading?: boolean;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  data,
  loading = false
}) => {
  const metrics = ['cpu', 'memory', 'responseTime'];
  const colors = ['#2196f3', '#4caf50', '#ff9800'];

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          System Performance
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Real-time monitoring of system resources
        </Typography>
      </Box>
      <LineChart
        data={data}
        height={350}
        loading={loading}
        metrics={metrics}
        colors={colors}
      />
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-around' }}>
        {metrics.map((metric, index) => (
          <Box
            key={metric}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: colors[index]
              }}
            />
            <Typography variant="body2" color="textSecondary">
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};