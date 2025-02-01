import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { Warning, Refresh, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  message?: string;
  showReset?: boolean;
  showBackButton?: boolean;
  loading?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetError,
  message = 'Something went wrong',
  showReset = true,
  showBackButton = true,
  loading = false
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Warning color="error" sx={{ fontSize: 64 }} />
          
          <Typography variant="h5" color="error">
            {message}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ maxWidth: 500, width: '100%' }}>
              {error.message}
            </Alert>
          )}

          <Stack direction="row" spacing={2}>
            {showBackButton && (
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
              >
                Go Back
              </Button>
            )}
            {showReset && resetError && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={resetError}
              >
                Try Again
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
};