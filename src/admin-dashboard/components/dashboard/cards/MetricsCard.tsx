import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  LinearProgress,
  Chip
} from '@mui/material';
import { TrendingUp, TrendingDown } from '@mui/icons-material';

interface MetricsCardProps {
  title: string;
  value: number | string;
  trend?: number;
  suffix?: string;
  loading?: boolean;
  variant?: 'default' | 'percentage' | 'memory' | 'time' | 'error' | 'status';
  realtime?: boolean;
}

export const MetricsCard: React.FC<MetricsCardProps> = ({
  title,
  value,
  trend,
  suffix = '',
  loading = false,
  variant = 'default',
  realtime = false
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'success';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'error';
      default:
        return 'default';
    }
  };

  const getValueColor = (val: number, type: string) => {
    if (type === 'error' || type === 'percentage') {
      if (val > 90) return 'error';
      if (val > 70) return 'warning';
      return 'success';
    }
    return 'primary';
  };

  const renderValue = () => {
    if (loading) return <CircularProgress size={20} />;

    if (variant === 'status') {
      return (
        <Chip
          label={value}
          color={getStatusColor(value as string)}
          size="small"
        />
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
        <Typography
          variant="h4"
          color={getValueColor(Number(value), variant)}
        >
          {value}
        </Typography>
        {suffix && (
          <Typography variant="subtitle1" color="textSecondary" sx={{ ml: 1 }}>
            {suffix}
          </Typography>
        )}
      </Box>
    );
  };

  const renderTrend = () => {
    if (!trend) return null;

    const isPositive = trend >= 0;
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          color: isPositive ? 'success.main' : 'error.main',
          mt: 1
        }}
      >
        {isPositive ? <TrendingUp /> : <TrendingDown />}
        <Typography variant="body2" sx={{ ml: 0.5 }}>
          {Math.abs(trend)}%
        </Typography>
      </Box>
    );
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <Typography color="textSecondary" gutterBottom>
            {title}
          </Typography>
          {realtime && (
            <Chip
              label="Real-time"
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        {renderValue()}
        {renderTrend()}
        {variant === 'percentage' && (
          <LinearProgress
            variant="determinate"
            value={Number(value)}
            color={getValueColor(Number(value), variant)}
            sx={{ mt: 2 }}
          />
        )}
      </CardContent>
    </Card>
  );
};