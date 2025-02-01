import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useTheme } from '@mui/material/styles';
import { Box, CircularProgress } from '@mui/material';

interface DataPoint {
  timestamp: string;
  value: number;
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  height?: number;
  loading?: boolean;
  metrics?: string[];
  colors?: string[];
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 300,
  loading = false,
  metrics = ['value'],
  colors
}) => {
  const theme = useTheme();

  const defaultColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.error.main
  ];

  if (loading) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart
        data={data}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="timestamp"
          tickFormatter={(value) => new Date(value).toLocaleTimeString()}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(value) => new Date(value).toLocaleString()}
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`
          }}
        />
        <Legend />
        {metrics.map((metric, index) => (
          <Line
            key={metric}
            type="monotone"
            dataKey={metric}
            stroke={colors?.[index] || defaultColors[index % defaultColors.length]}
            dot={false}
            activeDot={{ r: 8 }}
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};