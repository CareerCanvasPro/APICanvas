import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { Box, Typography } from '@mui/material';

interface ErrorRateChartProps {
  data: Array<{ timestamp: Date; count: number }>;
  currentRate: number;
}

export const ErrorRateChart: React.FC<ErrorRateChartProps> = ({
  data,
  currentRate
}) => {
  const formattedData = data.map(entry => ({
    time: entry.timestamp.toLocaleTimeString(),
    count: entry.count
  }));

  return (
    <Box>
      <Typography variant="h4" color="error" gutterBottom>
        {currentRate}
        <Typography component="span" variant="body1" color="textSecondary" sx={{ ml: 1 }}>
          errors/hour
        </Typography>
      </Typography>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#ff0000"
            dot={false}
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};