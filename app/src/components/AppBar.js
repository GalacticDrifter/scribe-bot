// components/AppBar.js
import React from 'react';
import { AppBar, Toolbar, Typography, Box, MenuItem, Select, CircularProgress, IconButton } from '@mui/material';
import { useVADContext } from '../context/VADContext';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import SocketStatus from './SocketStatus';
import logo from '../assets/images/logo.png'; // Make sure to have the logo image in the specified path

const ScribeBotAppBar = ({ currentTab, setCurrentTab }) => {
  const { toggleListening, isListening, isProcessing } = useVADContext();

  const handleChange = (event) => {
    setCurrentTab(event.target.value);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <img src={logo} alt="ScribeBot" style={{ height: 40, marginRight: 16 }} />
        <Typography variant="h6" component="div">
          ScribeBot
        </Typography>
        <Select
          value={currentTab}
          onChange={handleChange}
          variant="outlined"
          sx={{
            color: '#fff',
            borderColor: '#fff',
            marginLeft: 2,
            '& .MuiOutlinedInput-input': {
              padding: '10px 26px 10px 12px',
            },
            '& .MuiSelect-icon': {
              color: '#fff',
            },
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(255, 255, 255, 0.5)',
            },
          }}
        >
          <MenuItem value="/">Transcribe</MenuItem>
          <MenuItem value="/chat">Chat</MenuItem>
          <MenuItem value="/advisor">Advisor</MenuItem>
        </Select>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {isProcessing && (
          <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 2 }}>
            <CircularProgress color="inherit" size={24} />
            <Typography variant="body2" sx={{ marginLeft: 1 }}>
              Processing...
            </Typography>
          </Box>
        )}
        <SocketStatus />
        <IconButton
          onClick={toggleListening}
          color={!isListening ? 'rgba(0, 0, 0, 0.64)' : 'inherit'}
          sx={{
            marginLeft: 2,
            border: !isListening ? '1px solid rgba(0, 0, 0, 0.64)' : '1px solid white',
            '&:hover': {
              backgroundColor: '#0277bd',
            },
            backgroundColor: isListening ? 'rgba(0, 0, 0, 0.08)' : 'inherit',
            // animation: isListening ? 'pulse 1.5s ease-in-out infinite' : 'none',
          }}
        >
          {isListening ? (
            <MicIcon sx={{ fontSize: '1.8rem' }} />
          ) : (
            <MicOffIcon sx={{ fontSize: '1.8rem' }} />
          )}
        </IconButton>
        <style>
          {`
            @keyframes pulse {
              0% {
                transform: scale(1);
              }
              50% {
                transform: scale(0.9);
              }
              100% {
                transform: scale(1);
              }
            }
          `}
        </style>
      </Toolbar>
    </AppBar>
  );
};

export default ScribeBotAppBar;
