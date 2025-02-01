import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  Box,
  Divider,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  PersonAdd,
  Login,
  Logout,
  Edit,
  Delete,
  Warning,
  CheckCircle,
  Error
} from '@mui/icons-material';

interface Activity {
  id: string;
  type: 'user' | 'system' | 'error' | 'security';
  action: string;
  description: string;
  timestamp: string;
  user?: {
    name: string;
    avatar?: string;
  };
  severity?: 'info' | 'warning' | 'error' | 'success';
}

interface ActivityFeedProps {
  activities: Activity[];
  loading?: boolean;
  maxItems?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  loading = false,
  maxItems = 10
}) => {
  const getActivityIcon = (type: string, severity?: string) => {
    switch (type) {
      case 'user':
        if (activities.find(a => a.action === 'login')) return <Login color="primary" />;
        if (activities.find(a => a.action === 'logout')) return <Logout color="action" />;
        if (activities.find(a => a.action === 'register')) return <PersonAdd color="success" />;
        return <Edit color="primary" />;
      case 'system':
        return severity === 'success' ? (
          <CheckCircle color="success" />
        ) : (
          <Warning color="warning" />
        );
      case 'error':
        return <Error color="error" />;
      default:
        return <CheckCircle color="primary" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {activities.slice(0, maxItems).map((activity, index) => (
        <React.Fragment key={activity.id}>
          <ListItem alignItems="flex-start">
            <ListItemIcon>
              {activity.user?.avatar ? (
                <Avatar src={activity.user.avatar} alt={activity.user.name} />
              ) : (
                getActivityIcon(activity.type, activity.severity)
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography
                  component="span"
                  variant="body1"
                  color="text.primary"
                >
                  {activity.description}
                </Typography>
              }
              secondary={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {activity.user?.name}
                  </Typography>
                  <Typography
                    component="span"
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatTimestamp(activity.timestamp)}
                  </Typography>
                </Box>
              }
            />
          </ListItem>
          {index < activities.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
      {activities.length === 0 && (
        <ListItem>
          <ListItemText
            primary={
              <Typography color="textSecondary" align="center">
                No recent activities
              </Typography>
            }
          />
        </ListItem>
      )}
    </List>
  );
};