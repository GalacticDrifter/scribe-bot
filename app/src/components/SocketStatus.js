// components/SocketStatus.js
import React, { useContext, useState, useEffect } from 'react';
import { Chip } from '@mui/material';
import { SocketContext } from '../context/SocketContext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ErrorIcon from '@mui/icons-material/Error';

const SocketStatus = () => {
  const socket = useContext(SocketContext);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log('Connected to server');
      setStatus('connected');
    };

    const handleDisconnect = (reason) => {
      console.log('Disconnected from server:', reason);
      setStatus('disconnected');
    };

    const handleConnectError = (reason) => {
      console.log('Connection error:', reason);
      setStatus('disconnected');
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
    };
  }, [socket]);

  const getColor = () => {
    switch (status) {
      case 'connected':
        return 'success';
      case 'disconnected':
        return 'error';
      case 'connecting':
      default:
        return 'warning';
    }
  };

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon color="success" />;
      case 'disconnected':
        return <ErrorIcon color="error" />;
      case 'connecting':
      default:
        return <RemoveCircleIcon color="warning" />;
    }
  };

  return (
      <Chip color={getColor()} icon={getIcon()} label={status.charAt(0).toUpperCase() + status.slice(1)} />
  );
};

export default SocketStatus;
