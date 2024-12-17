import React from 'react';
import { Drawer, List, ListItem, ListItemText, ListSubheader } from '@mui/material';
import { useVADContext } from '../context/VADContext';

const PlaylistDrawer = ({ toggleDrawer, isDrawerOpen }) => {
  const { playlist } = useVADContext();

  return (
      <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)}>
        <div
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List subheader={
            <ListSubheader component="h5" id="audio-recording-subheader">
              Audio Recordings
            </ListSubheader>
          }>
            {playlist.map((url, index) => (
              <ListItem key={index}>
                <ListItemText primary={`Audio ${index + 1}`} />
                <audio controls src={url}></audio>
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>
  );
};

export default PlaylistDrawer;
