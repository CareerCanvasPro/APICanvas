import React from 'react';
import {
  TextField,
  Button,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput
} from '@mui/material';
import { useForm } from '../../hooks/useForm';
import { createRole, updateRole } from '../../api/admin';
import { Role } from '../../types/api.types';

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const initialValues: RoleFormData = {
  name: '',
  description: '',
  permissions: []
};

const validateRole = (values: RoleFormData) => {
  const errors: Partial<Record<keyof RoleFormData, string>> = {};

  if (!values.name) {
    errors.name = 'Role name is required';
  } else if (values.name.length < 3) {
    errors.name = 'Role name must be at least 3 characters';
  }

  if (!values.description) {
    errors.description = 'Description is required';
  }

  return Object.keys(errors).length ? errors as Record<keyof RoleFormData, string> : null;
};

interface RoleFormProps {
  role?: Partial<Role>;
  onSuccess: () => void;
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, onSuccess }) => {
  const {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    setValues
  } = useForm<RoleFormData>({
    initialValues: role ? {
      ...initialValues,
      ...role,
      permissions: role.permissions?.map(p => p.id) || []
    } : initialValues,
    validate: validateRole,
    onSubmit: async (formData) => {
      if (role?.id) {
        await updateRole(role.id, formData);
      } else {
        await createRole(formData);
      }
      onSuccess();
    }
  });

  const handlePermissionChange = (event: any) => {
    const {
      target: { value },
    } = event;
    handleChange('permissions', typeof value === 'string' ? value.split(',') : value);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <TextField
        fullWidth
        margin="normal"
        label="Role Name"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={!!errors?.name}
        helperText={errors?.name}
      />

      <TextField
        fullWidth
        margin="normal"
        label="Description"
        multiline
        rows={3}
        value={values.description}
        onChange={(e) => handleChange('description', e.target.value)}
        error={!!errors?.description}
        helperText={errors?.description}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel>Default Permissions</InputLabel>
        <Select
          multiple
          value={values.permissions}
          onChange={handlePermissionChange}
          input={<OutlinedInput label="Default Permissions" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
        >
          {['read', 'write', 'delete', 'admin'].map((permission) => (
            <MenuItem key={permission} value={permission}>
              {permission}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

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
          role?.id ? 'Update Role' : 'Create Role'
        )}
      </Button>
    </Box>
  );
};