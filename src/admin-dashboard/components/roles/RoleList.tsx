import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Typography,
  Dialog,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox
} from '@mui/material';
import { Edit, Delete, Security } from '@mui/icons-material';
import { useApi } from '../../hooks/useApi';
import { fetchRoles, deleteRole, assignPermissions } from '../../api/admin';
import { Role, Permission } from '../../types/api.types';
import { RoleForm } from './RoleForm';

export const RoleList: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  const { data: roles, loading, error, execute: loadRoles } = useApi(fetchRoles);
  const { execute: handleDelete } = useApi(deleteRole);
  const { execute: handlePermissionAssignment } = useApi(assignPermissions);

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      await handleDelete(roleId);
      loadRoles();
    }
  };

  const handlePermissionClick = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.permissions.map(p => p.id));
    setIsPermissionDialogOpen(true);
  };

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handlePermissionSave = async () => {
    if (selectedRole) {
      await handlePermissionAssignment(selectedRole.id, selectedPermissions);
      setIsPermissionDialogOpen(false);
      loadRoles();
    }
  };

  if (error) {
    return <Typography color="error">Error loading roles: {error.message}</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Role Management</Typography>
        <Button
          variant="contained"
          startIcon={<Security />}
          onClick={() => setIsFormOpen(true)}
        >
          Create Role
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Role Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Permissions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">Loading...</TableCell>
              </TableRow>
            ) : roles?.map(role => (
              <TableRow key={role.id}>
                <TableCell>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => handlePermissionClick(role)}
                  >
                    {role.permissions.length} Permissions
                  </Button>
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(role)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(role.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedRole ? 'Edit Role' : 'Create New Role'}
          </Typography>
          <RoleForm
            role={selectedRole || undefined}
            onSuccess={() => {
              setIsFormOpen(false);
              loadRoles();
            }}
          />
        </Box>
      </Dialog>

      <Dialog
        open={isPermissionDialogOpen}
        onClose={() => setIsPermissionDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Manage Permissions for {selectedRole?.name}
          </Typography>
          <List>
            {selectedRole?.permissions.map((permission: Permission) => (
              <ListItem key={permission.id}>
                <Checkbox
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={() => handlePermissionToggle(permission.id)}
                />
                <ListItemText
                  primary={permission.name}
                  secondary={permission.description}
                />
              </ListItem>
            ))}
          </List>
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={() => setIsPermissionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handlePermissionSave}
              sx={{ ml: 1 }}
            >
              Save Permissions
            </Button>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
};