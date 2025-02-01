import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  AlertTitle
} from '@mui/material';
import { Refresh, BugReport } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to your error tracking service
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
            p: 3
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              width: '100%'
            }}
          >
            <Stack spacing={3} alignItems="center">
              <BugReport color="error" sx={{ fontSize: 48 }} />
              
              <Typography variant="h5" color="error" gutterBottom>
                Something went wrong
              </Typography>

              <Alert severity="error" sx={{ width: '100%' }}>
                <AlertTitle>Error Details</AlertTitle>
                {this.state.error?.message}
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    maxHeight: 200,
                    overflow: 'auto',
                    width: '100%',
                    bgcolor: 'grey.100'
                  }}
                >
                  <Typography variant="caption" component="pre">
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </Paper>
              )}

              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleReset}
              >
                Try Again
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}