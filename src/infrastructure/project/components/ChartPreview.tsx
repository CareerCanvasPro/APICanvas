import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid,
  Line, PieChart, Pie, Cell, AreaChart, Area, ComposedChart, Scatter,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import {
  Box, ToggleButtonGroup, ToggleButton, Slider, Typography,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, TextField
} from '@mui/material';
import {
  BarChart as BarIcon, PieChart as PieIcon, Timeline,
  StackedLineChart, RadarIcon, Edit, Check, Close
} from '@mui/icons-material';
import { Download, Refresh, DataUsage } from '@mui/icons-material';
import { Menu, MenuItem, Snackbar, Alert } from '@mui/material';
import { CompareArrows, TrendingUp, Analytics } from '@mui/icons-material';
import { Drawer, Divider, List, ListItem, ListItemText } from '@mui/material';
import { Functions, Timeline as TimelineIcon, ShowChart } from '@mui/icons-material';
import { ReferenceArea, ReferenceLine } from 'recharts';

interface DataPattern {
  name: string;
  generator: (points: number) => any[];
}

export const ChartPreview: React.FC<ChartPreviewProps> = ({ settings }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string>('random');

  const dataPatterns: Record<string, DataPattern> = {
    random: {
      name: 'Random',
      generator: (points) => Array.from({ length: points }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        value1: Math.floor(Math.random() * 500) + 100,
        value2: Math.floor(Math.random() * 800) + 200,
        value3: Math.floor(Math.random() * 300) + 150
      }))
    },
    linear: {
      name: 'Linear Growth',
      generator: (points) => Array.from({ length: points }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        value1: 100 + (i * 50),
        value2: 200 + (i * 80),
        value3: 150 + (i * 30)
      }))
    },
    exponential: {
      name: 'Exponential',
      generator: (points) => Array.from({ length: points }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        value1: Math.pow(1.5, i) * 100,
        value2: Math.pow(1.3, i) * 200,
        value3: Math.pow(1.2, i) * 150
      }))
    },
    seasonal: {
      name: 'Seasonal',
      generator: (points) => Array.from({ length: points }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        value1: 300 + Math.sin(i * Math.PI / 2) * 200,
        value2: 500 + Math.cos(i * Math.PI / 2) * 300,
        value3: 200 + Math.sin(i * Math.PI / 3) * 100
      }))
    },
    gaussian: {
      name: 'Bell Curve',
      generator: (points) => {
        const mid = (points - 1) / 2;
        return Array.from({ length: points }, (_, i) => ({
          name: String.fromCharCode(65 + i),
          value1: 500 * Math.exp(-Math.pow(i - mid, 2) / (2 * Math.pow(mid/2, 2))),
          value2: 800 * Math.exp(-Math.pow(i - mid, 2) / (2 * Math.pow(mid/3, 2))),
          value3: 300 * Math.exp(-Math.pow(i - mid, 2) / (2 * Math.pow(mid/4, 2)))
        }));
      }
    },
    stepwise: {
      name: 'Step Pattern',
      generator: (points) => Array.from({ length: points }, (_, i) => ({
        name: String.fromCharCode(65 + i),
        value1: Math.floor(i / 2) * 200 + 100,
        value2: Math.floor(i / 3) * 300 + 200,
        value3: Math.floor(i / 2) * 150 + 150
      }))
    }
  };

  // Add animation presets
  const animationPresets = {
    bounce: {
      easing: 'ease-in-out',
      duration: 1500,
      delay: 200
    },
    smooth: {
      easing: 'linear',
      duration: 1000,
      delay: 0
    },
    elastic: {
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      duration: 2000,
      delay: 100
    }
  };

  // Update chart rendering functions to include animation presets
  const renderBarChart = () => (
    <BarChart data={sampleData}>
      {/* ... existing chart configuration ... */}
      <Bar
        dataKey="value1"
        fill={settings.colors[0]}
        radius={[settings.barRadius, settings.barRadius, 0, 0]}
        isAnimationActive={true}
        animationDuration={animationPresets[settings.animation].duration}
        animationEasing={animationPresets[settings.animation].easing}
        animationBegin={animationPresets[settings.animation].delay}
      />
      {/* ... similar updates for other Bar components ... */}
    </BarChart>
  );

  const calculateTrends = (data: any[]) => {
    const trends = {
      average: {
        value1: data.reduce((acc, curr) => acc + curr.value1, 0) / data.length,
        value2: data.reduce((acc, curr) => acc + curr.value2, 0) / data.length,
        value3: data.reduce((acc, curr) => acc + curr.value3, 0) / data.length,
      },
      growth: {
        value1: ((data[data.length - 1].value1 - data[0].value1) / data[0].value1) * 100,
        value2: ((data[data.length - 1].value2 - data[0].value2) / data[0].value2) * 100,
        value3: ((data[data.length - 1].value3 - data[0].value3) / data[0].value3) * 100,
      },
      volatility: {
        value1: Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.value1 - trends.average.value1, 2), 0) / data.length),
        value2: Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.value2 - trends.average.value2, 2), 0) / data.length),
        value3: Math.sqrt(data.reduce((acc, curr) => acc + Math.pow(curr.value3 - trends.average.value3, 2), 0) / data.length),
      }
    };
    return trends;
  };

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [forecastPoints, setForecastPoints] = useState(3);

  const calculateStatistics = (data: any[]) => {
    const stats = {
      correlation: {
        'value1-value2': calculateCorrelation(data.map(d => d.value1), data.map(d => d.value2)),
        'value1-value3': calculateCorrelation(data.map(d => d.value1), data.map(d => d.value3)),
        'value2-value3': calculateCorrelation(data.map(d => d.value2), data.map(d => d.value3))
      },
      regression: {
        value1: calculateLinearRegression(data.map((_, i) => i), data.map(d => d.value1)),
        value2: calculateLinearRegression(data.map((_, i) => i), data.map(d => d.value2)),
        value3: calculateLinearRegression(data.map((_, i) => i), data.map(d => d.value3))
      }
    };
    return stats;
  };

  const calculateCorrelation = (x: number[], y: number[]) => {
    const meanX = x.reduce((a, b) => a + b) / x.length;
    const meanY = y.reduce((a, b) => a + b) / y.length;
    const covariance = x.map((xi, i) => (xi - meanX) * (y[i] - meanY)).reduce((a, b) => a + b);
    const stdX = Math.sqrt(x.map(xi => Math.pow(xi - meanX, 2)).reduce((a, b) => a + b));
    const stdY = Math.sqrt(y.map(yi => Math.pow(yi - meanY, 2)).reduce((a, b) => a + b));
    return covariance / (stdX * stdY);
  };

  const calculateLinearRegression = (x: number[], y: number[]) => {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b);
    const sumY = y.reduce((a, b) => a + b);
    const sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b);
    const sumXX = x.map(xi => xi * xi).reduce((a, b) => a + b);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return { slope, intercept };
  };

  const generateForecast = (data: any[]) => {
    const regressions = calculateStatistics(data).regression;
    const lastIndex = data.length - 1;
    
    return Array.from({ length: forecastPoints }, (_, i) => ({
      name: String.fromCharCode(65 + lastIndex + i + 1),
      value1: regressions.value1.slope * (lastIndex + i + 1) + regressions.value1.intercept,
      value2: regressions.value2.slope * (lastIndex + i + 1) + regressions.value2.intercept,
      value3: regressions.value3.slope * (lastIndex + i + 1) + regressions.value3.intercept
    }));
  };

  // Update renderAnalysisDrawer to include new statistics
  const renderAnalysisDrawer = () => (
    <Drawer anchor="right" open={showAnalysis} onClose={() => setShowAnalysis(false)}>
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" gutterBottom>Advanced Analysis</Typography>
        <Divider />
        <List>
          {Object.entries(calculateTrends(sampleData)).map(([metric, values]) => (
            <React.Fragment key={metric}>
              <ListItem>
                <ListItemText
                  primary={metric.charAt(0).toUpperCase() + metric.slice(1)}
                  secondary={
                    <Box>
                      {Object.entries(values).map(([key, value]) => (
                        <Typography key={key} variant="body2">
                          {key}: {value.toFixed(2)}
                        </Typography>
                      ))}
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
          <ListItem>
            <ListItemText
              primary="Correlations"
              secondary={
                <Box>
                  {Object.entries(calculateStatistics(sampleData).correlation).map(([key, value]) => (
                    <Typography key={key} variant="body2">
                      {key}: {value.toFixed(3)}
                    </Typography>
                  ))}
                </Box>
              }
            />
          </ListItem>
          <Divider />
          <ListItem>
            <Box sx={{ width: '100%' }}>
              <Typography variant="subtitle2" gutterBottom>Forecast Points</Typography>
              <Slider
                value={forecastPoints}
                onChange={(_, value) => setForecastPoints(value as number)}
                min={1}
                max={5}
                marks
                step={1}
              />
            </Box>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );

  // Update chart data to include forecasts when enabled
  const chartData = useMemo(() => {
    if (showForecast) {
      return [...sampleData, ...generateForecast(sampleData)];
    }
    return sampleData;
  }, [sampleData, showForecast, forecastPoints]);

  // Add new controls to the toolbar
  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, value) => value && setChartType(value)}
          size="small"
        >
          <ToggleButton value="bar"><BarIcon /></ToggleButton>
          <ToggleButton value="pie"><PieIcon /></ToggleButton>
          <ToggleButton value="area"><Timeline /></ToggleButton>
          <ToggleButton value="composed"><StackedLineChart /></ToggleButton>
          <ToggleButton value="radar"><RadarIcon /></ToggleButton>
        </ToggleButtonGroup>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => setShowAnalysis(true)}>
            <Functions />
          </IconButton>
          <IconButton
            onClick={() => setShowForecast(!showForecast)}
            color={showForecast ? 'primary' : 'default'}
          >
            <ShowChart />
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <DataUsage />
          </IconButton>
          <IconButton onClick={() => setEditedData(dataPatterns[pattern].generator(dataPoints))}>
            <Refresh />
          </IconButton>
          <IconButton onClick={handleExport}>
            <Download />
          </IconButton>
          <IconButton onClick={() => setEditingData(!editingData)}>
            {editingData ? <Check /> : <Edit />}
          </IconButton>
          {editingData && (
            <IconButton onClick={() => {
              setEditedData([]);
              setEditingData(false);
            }}>
              <Close />
            </IconButton>
          )}
          <Box sx={{ width: 200 }}>
            <Typography variant="caption" gutterBottom>Data Points</Typography>
            <Slider
              value={dataPoints}
              onChange={(_, value) => setDataPoints(value as number)}
              min={3}
              max={10}
              step={1}
              marks
              size="small"
              disabled={editingData}
            />
          </Box>
        </Box>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {Object.entries(dataPatterns).map(([key, { name }]) => (
          <MenuItem
            key={key}
            selected={pattern === key}
            onClick={() => {
              setPattern(key);
              setAnchorEl(null);
            }}
          >
            {name}
          </MenuItem>
        ))}
      </Menu>
      {editingData && renderDataEditor()}
      <ResponsiveContainer>
        {chartType === 'bar' ? renderBarChart() :
         chartType === 'pie' ? renderPieChart() :
         chartType === 'area' ? renderAreaChart() :
         chartType === 'radar' ? renderRadarChart() :
         renderComposedChart()}
      </ResponsiveContainer>
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};