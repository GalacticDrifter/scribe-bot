import React, { useState } from 'react';
import { Box, List, ListItemText, Typography, ListItemButton, ListItemIcon } from '@mui/material';
import TranscribeFeed from '../components/TranscribeFeed';
import PlaylistDrawer from '../components/PlaylistDrawer';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import DownloadIcon from '@mui/icons-material/Download'

function TranscribePage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ width: 250, minWidth: 250, height: '100%', overflowY: 'auto', padding: 2, borderRight: '1px solid #ccc' }}>
        <Typography variant="h6" color="text.secondary" style={{ textAlign: 'center' }}>Transcribe Settings</Typography>
        <List>
          <ListItemButton onClick={toggleDrawer(true)}>
            <ListItemIcon>
              <QueueMusicIcon />
            </ListItemIcon>
            <ListItemText>
              Audio Clips
            </ListItemText>
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon>
              <DownloadIcon />
            </ListItemIcon>
            <ListItemText>
              Export Text
            </ListItemText>
          </ListItemButton>
        </List>
      </Box>
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TranscribeFeed feedId="transcribe" hideUserQuery={false} />
        <PlaylistDrawer isDrawerOpen={isDrawerOpen} toggleDrawer={toggleDrawer} />
      </Box>

    </Box>
  );
}

export default TranscribePage;
