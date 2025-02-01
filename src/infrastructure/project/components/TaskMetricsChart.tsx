import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, RadialBarChart,
  RadialBar, Sector, AnimationTiming
} from 'recharts';
import { Box, ToggleButton, ToggleButtonGroup, Typography, IconButton, TextField } from '@mui/material';
import { DateRangePicker } from '@mui/lab';
import { Download, PieChart as PieIcon, BarChart as BarIcon, Timeline, DonutLarge, Settings } from '@mui/icons-material';
import { TaskMetrics } from '../types';
import { useWebSocket } from '../hooks/useWebSocket';

interface TaskMetricsChartProps {
  metrics: TaskMetrics;
}

type ChartView = 'time' | 'progress' | 'combined' | 'distribution';

const COLORS = ['#2196f3', '#4caf50', '#ff9800', '#f44336'];
const RADIAN = Math.PI / 180;

export const TaskMetricsChart: React.FC<TaskMetricsChartProps> = ({ metrics }) => {
  const [view, setView] = useState<ChartView>('combined');
  const [activeIndex, setActiveIndex] = useState(0);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
  const [showSettings, setShowSettings] = useState(false);

  const ws = useWebSocket(`ws://${window.location.host}/api/metrics/ws`);

  useEffect(() => {
    if (ws) {
      ws.onmessage = (event) => {
        const updatedMetrics = JSON.parse(event.data);
        // Handle real-time metrics updates
      };
    }
  }, [ws]);

  const filteredTimeData = useMemo(() => {
    let data = Object.entries(metrics.timeInStatus).map(([status, time]) => ({
      status,
      hours: +(time / (1000 * 60 * 60)).toFixed(2),
      progressRate: +(metrics.completionRate * 100).toFixed(1),
      percentage: +(time / Object.values(metrics.timeInStatus).reduce((a, b) => a + b, 0) * 100).toFixed(1)
    }));

    if (dateRange[0] && dateRange[1]) {
      data = data.filter(item => {
        const itemDate = new Date(item.timestamp);
        return itemDate >= dateRange[0]! && itemDate <= dateRange[1]!;
      });
    }

    return data;
  }, [metrics, dateRange]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;

    return (
      <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
        <Typography variant="subtitle2">{label}</Typography>
        {payload.map((entry: any, index: number) => (
          <Typography key={index} variant="body2" sx={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(2)} {entry.name.includes('Rate') ? '%' : 'hours'}
          </Typography>
        ))}
      </Box>
    );
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
    
    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={outerRadius + 6}
          outerRadius={outerRadius + 10}
          fill={fill}
        />
        <text x={cx} y={cy} dy={-4} textAnchor="middle" fill={fill}>
          {payload.status}
        </text>
        <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#666">
          {`${value.toFixed(1)}%`}
        </text>
      </g>
    );
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      timeData.map(row => Object.values(row).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "task_metrics.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartAnimationProps = {
    isAnimationActive: true,
    animationBegin: 0,
    animationDuration: 1000,
    animationEasing: 'ease-in-out' as AnimationTiming
  };

  const renderTimeChart = () => (
    <BarChart data={filteredTimeData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="status" />
      <YAxis yAxisId="left" orientation="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
      <Tooltip content={<CustomTooltip />} />
      <Legend />
      <Bar
        {...chartAnimationProps}
        yAxisId="left"
        dataKey="hours"
        fill="#2196f3"
        name="Time in Status"
        radius={[4, 4, 0, 0]}
      />
    </BarChart>
  );

  const renderProgressChart = () => (
    <LineChart data={timeData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="status" />
      <YAxis
        yAxisId="right"
        orientation="right"
        domain={[0, 100]}
        label={{ value: 'Progress %', angle: 90, position: 'insideRight' }}
      />
      <Tooltip />
      <Legend />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="progressRate"
        stroke="#4caf50"
        name="Progress Rate"
        dot={{ r: 4 }}
      />
    </LineChart>
  );

  const renderCombinedChart = () => (
    <BarChart data={timeData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="status" />
      <YAxis yAxisId="left" orientation="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
      <YAxis
        yAxisId="right"
        orientation="right"
        domain={[0, 100]}
        label={{ value: 'Progress %', angle: 90, position: 'insideRight' }}
      />
      <Tooltip />
      <Legend />
      <Bar
        yAxisId="left"
        dataKey="hours"
        fill="#2196f3"
        name="Time in Status"
        radius={[4, 4, 0, 0]}
      />
      <Line
        yAxisId="right"
        type="monotone"
        dataKey="progressRate"
        stroke="#4caf50"
        name="Progress Rate"
        dot={{ r: 4 }}
      />
    </BarChart>
  );

  const renderDistributionChart = () => (
    <PieChart>
      <Pie
        activeIndex={activeIndex}
        activeShape={renderActiveShape}
        data={timeData}
        innerRadius={60}
        outerRadius={80}
        dataKey="percentage"
        onMouseEnter={(_, index) => setActiveIndex(index)}
      >
        {timeData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip />} />
      <Legend />
    </PieChart>
  );

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle1" color="textSecondary">
          Task Progress Analysis
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            renderInput={(startProps, endProps) => (
              <>
                <TextField {...startProps} size="small" />
                <Box sx={{ mx: 1 }}> to </Box>
                <TextField {...endProps} size="small" />
              </>
            )}
          />
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, newView) => newView && setView(newView)}
            size="small"
          >
            <ToggleButton value="time"><BarIcon /></ToggleButton>
            <ToggleButton value="progress"><Timeline /></ToggleButton>
            <ToggleButton value="combined"><DonutLarge /></ToggleButton>
            <ToggleButton value="distribution"><PieIcon /></ToggleButton>
          </ToggleButtonGroup>
          <IconButton onClick={() => setShowSettings(!showSettings)} size="small">
            <Settings />
          </IconButton>
          <IconButton onClick={handleExport} size="small">
            <Download />
          </IconButton>
        </Box>
      </Box>
      <ResponsiveContainer width="100%" height={400}>
        {view === 'time' ? renderTimeChart() :
         view === 'progress' ? renderProgressChart() :
         view === 'distribution' ? renderDistributionChart() :
         renderCombinedChart()}
      </ResponsiveContainer>
    </Box>
  );
};