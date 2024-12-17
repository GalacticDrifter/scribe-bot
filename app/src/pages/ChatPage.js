import React, { useState } from 'react';
import { Box, List, ListItem, FormControlLabel, Switch, Typography } from '@mui/material';
import TranscribeFeed from '../components/TranscribeFeed';

function ChatPage() {
  const [hideUserQuery, setHideUserQuery] = useState(false);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ width: 250, minWidth: 250, height: '100%', overflowY: 'auto', padding: 2, borderRight: '1px solid #ccc' }}>
      <Typography variant="h6" color="text.secondary" style={{textAlign: 'center'}}>Chat Settings</Typography>
          <List>
            <ListItem>
              <FormControlLabel
                control={<Switch checked={hideUserQuery} onChange={() => setHideUserQuery(!hideUserQuery)} />}
                label="Hide User Query"
              />
            </ListItem>
          </List>
      </Box>
      <Box sx={{ flexGrow: 1 }}>
        <TranscribeFeed feedId="chat" hideUserQuery={hideUserQuery} />
      </Box>
    </Box>
  );
}

export default ChatPage;
