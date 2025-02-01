import React from 'react';
import { TextField, Button, Box, CircularProgress } from '@mui/material';
import { useForm } from '../../hooks/useForm';
import { createUser, updateUser } from '../../api/admin';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const initialValues: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  role: ''
};

const validateUser = (values: UserFormData) => {
  const errors: Partial<Record<keyof UserFormData, string>> = {};

  if (!values.firstName) errors.firstName = 'First name is required';
  if (!values.lastName) errors.lastName = 'Last name is required';
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.role) errors.role = 'Role is required';

  return Object.keys(errors).length ? errors as Record<keyof UserFormData, string> : null;
};

interface UserFormProps {
  user?: Partial<UserFormData>;
  onSuccess: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess }) => {
  const {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit
  } = useForm<UserFormData>({
    initialValues: user ? { ...initialValues, ...user } : initialValues,
    validate: validateUser,
    onSubmit: async (formData) => {
      if (user?.id) {
        await updateUser(user.id, formData);
      } else {
        await createUser(formData);
      }
      onSuccess();
    }
  });

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        label="First Name"
        value={values.firstName}
        onChange={(e) => handleChange('firstName', e.target.value)}
        error={!!errors?.firstName}
        helperText={errors?.firstName}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Last Name"
        value={values.lastName}
        onChange={(e) => handleChange('lastName', e.target.value)}
        error={!!errors?.lastName}
        helperText={errors?.lastName}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        type="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={!!errors?.email}
        helperText={errors?.email}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Role"
        value={values.role}
        onChange={(e) => handleChange('role', e.target.value)}
        error={!!errors?.role}
        helperText={errors?.role}
      />
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        disabled={loading}
        sx={{ mt: 3, mb: 2 }}
      >
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : (
          user?.id ? 'Update User' : 'Create User'
        )}
      </Button>
    </Box>
  );
};