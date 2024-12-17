import React, { useState, useEffect } from 'react';
import { Box, List, ListItem, Switch, FormControlLabel, Select, MenuItem, Alert, Snackbar, FormControl, InputLabel, Typography  } from '@mui/material';
import TranscribeFeed from '../components/TranscribeFeed';
import CallerDetails from '../components/CallerDetails';
import { getUsers, getCallers, getAdvisors, getConversationHistory } from '../services/api';
import { useGlobal } from '../context/GlobalContext';

const AdvisorPage = () => {
  const [advisors, setAdvisors] = useState([]);
  const [callers, setCallers] = useState([]);
  const [users, setUsers] = useState([]);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [hideUserQuery, setHideUserQuery] = useState(false);
  const [showCallerCard, setShowCallerCard] = useState(true);
  const [error, setError] = useState(null);

  const { selectedAdvisor, setSelectedAdvisor, selectedUser, setSelectedUser, selectedCaller, setSelectedCaller } = useGlobal();

  useEffect(() => {
    const fetchAdvisors = async () => {
      try {
        const advisorArray = await getAdvisors();
        setAdvisors(advisorArray);
        setSelectedAdvisor(advisorArray[0].advisorId);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersArray = await getUsers();
        setUsers(usersArray);
        setSelectedUser(usersArray[0].userId);
      } catch (error) {
        setError(error.message);
      }
    };

    const fetchCallers = async () => {
      try {
        const callersArray = await getCallers();
        setCallers(callersArray);
        setSelectedCaller(callersArray[0].callerId);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchAdvisors();
    fetchUsers();
    fetchCallers();
  }, [setSelectedAdvisor, setSelectedUser, setSelectedCaller]);

  useEffect(() => {
    const fetchConvoHistory = async () => {
      if (selectedUser && selectedCaller) {
        try {
          const convoParams = {
            userId: selectedUser,
            callerId: selectedCaller,
          };
          const convoHistory = await getConversationHistory(convoParams);
          console.log("convoHistory: ", convoHistory);
          setConversationHistory(convoHistory);
        } catch (error) {
          setError(error.message);
        }
      }
    };

    fetchConvoHistory();
  }, [selectedUser, selectedCaller]);

  const handleUserChange = (event) => {
    setSelectedUser(event.target.value);
  };

  const handleCallerChange = (event) => {
    setSelectedCaller(event.target.value);
  };

  const handleAdvisorChange = (event) => {
    setSelectedAdvisor(event.target.value);
  };

  const handleSnackbarClose = () => {
    setError(null);
  };

  const selectedCallerInfo = callers.find(caller => caller.callerId === selectedCaller);

  return (
    <Box sx={{ display: 'flex', height: '100%' }}>
      <Box sx={{ width: 250, minWidth: 250, height: '100%', overflowY: 'auto', padding: 2, borderRight: '1px solid #ccc' }}>
        <Typography variant="h6" color="text.secondary" style={{textAlign: 'center'}}>Advisor Settings</Typography>
        <List>
          <ListItem>
            <FormControl sx={{ minWidth: '100%' }}>
              <InputLabel id="advisor-select">Advisors</InputLabel>
              <Select
                labelId="advisor-select"
                value={selectedAdvisor}
                onChange={handleAdvisorChange}
                autoWidth
                label="Advisors"
                inputProps={{ 'aria-label': 'Advisor List' }}
              >
                {advisors.map((advisor, index) => (
                  <MenuItem key={index} value={advisor.advisorId}>{advisor.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          <ListItem>
            <FormControl sx={{ minWidth: '100%' }}>
              <InputLabel id="caller-select">Callers</InputLabel>
              <Select
                labelId="caller-select"
                value={selectedCaller}
                onChange={handleCallerChange}
                autoWidth
                label="Callers"
                inputProps={{ 'aria-label': 'Caller List' }}
              >
                {callers.map((caller, index) => (
                  <MenuItem key={index} value={caller.callerId}>{caller.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          <ListItem>
            <FormControl sx={{ minWidth: '100%' }}>
              <InputLabel id="user-select">Users</InputLabel>
              <Select
                labelId="user-select"
                value={selectedUser}
                onChange={handleUserChange}
                autoWidth
                label="Users"
                inputProps={{ 'aria-label': 'User List' }}
              >
                {users.map((user, index) => (
                  <MenuItem key={index} value={user.userId}>{user.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </ListItem>
          <ListItem>
            <FormControlLabel
              control={<Switch checked={hideUserQuery} onChange={() => setHideUserQuery(!hideUserQuery)} />}
              label="Hide User Query"
            />
          </ListItem>
          <ListItem>
            <FormControlLabel
              control={<Switch checked={showCallerCard} onChange={() => setShowCallerCard(!showCallerCard)} />}
              label="Show Caller Card"
            />
          </ListItem>
        </List>


        {showCallerCard && <CallerDetails caller={selectedCallerInfo} />}

        {/* <Button onClick={() => fetchConvoHistory(selectedUser, selectedCaller)} style={{ width: '100%' }}>Conversation History</Button> */}
      </Box>

      <TranscribeFeed feedId="advisor" hideUserQuery={hideUserQuery} selectedAdvisor={selectedAdvisor} selectedUser={selectedUser} selectedCaller={selectedCaller} conversationHistory={conversationHistory} />

      <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity="error" variant="filled">
          {error || 'An error occurred...'}
        </Alert>
      </Snackbar>


      {/* <ConversationHistoryDrawer open={showConversationHistory} onClose={() => setShowConversationHistory(false)} conversationHistory={conversationHistory} /> */}
    </Box>
  );
};

export default AdvisorPage;