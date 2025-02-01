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
  TablePagination,
  TextField,
  Box,
  Typography,
  Dialog,
  Chip
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { usePagination } from '../../hooks/usePagination';
import { useApi } from '../../hooks/useApi';
import { fetchUsers, deleteUser } from '../../api/admin';
import { UserForm } from './UserForm';
import { User } from '../../types/api.types';

export const UserList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const {
    page,
    limit,
    loading,
    data,
    error,
    fetchPage,
    changeLimit
  } = usePagination({
    fetchFunction: fetchUsers,
    initialLimit: 10
  });

  const { execute: handleDelete } = useApi(deleteUser);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await handleDelete(userId);
      fetchPage(page);
    }
  };

  const handleFormClose = () => {
    setSelectedUser(null);
    setIsFormOpen(false);
    fetchPage(page);
  };

  const filteredUsers = data?.items.filter(user =>
    `${user.firstName} ${user.lastName} ${user.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (error) {
    return <Typography color="error">Error loading users: {error.message}</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          size="small"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ width: 300 }}
        />
        <IconButton color="primary" onClick={() => setIsFormOpen(true)}>
          <Add />
        </IconButton>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center">Loading...</TableCell>
              </TableRow>
            ) : filteredUsers?.map(user => (
              <TableRow key={user.id}>
                <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role.name}</TableCell>
                <TableCell>
                  <Chip
                    label={user.status}
                    color={user.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(user)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeleteClick(user.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data?.total || 0}
          page={page - 1}
          rowsPerPage={limit}
          onPageChange={(_, newPage) => fetchPage(newPage + 1)}
          onRowsPerPageChange={(e) => changeLimit(parseInt(e.target.value, 10))}
        />
      </TableContainer>

      <Dialog
        open={isFormOpen}
        onClose={handleFormClose}
        maxWidth="sm"
        fullWidth
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedUser ? 'Edit User' : 'Create New User'}
          </Typography>
          <UserForm
            user={selectedUser || undefined}
            onSuccess={handleFormClose}
          />
        </Box>
      </Dialog>
    </Box>
  );
};