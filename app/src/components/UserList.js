import React, { useEffect, useState } from 'react';
import { getUsers } from '../services/api';
import { Alert, Box, Typography, CircularProgress } from '@mui/material';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersArray = await getUsers();
        setUsers(usersArray);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      {users.map((user) => (
        <Box key={user.userId} sx={{ marginBottom: 2 }}>
          <Typography variant="h6">{user.name}</Typography>
          <Typography variant="body2">Experience Level: {user.experience_level}</Typography>
          <Typography variant="body2">Conversion Rate: {user.performance_metrics.conversion_rate}</Typography>
          <Typography variant="body2">Customer Satisfaction: {user.performance_metrics.customer_satisfaction}</Typography>
          <Typography variant="body2">Sales Approach: {user.preferred_sales_approach}</Typography>
          <Typography variant="body2">Specialization: {user.specialization}</Typography>
        </Box>
      ))}
    </Box>
  );
};

export default UserList;
