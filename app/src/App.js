// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blue, teal } from '@mui/material/colors';
import ScribeBotAppBar from './components/AppBar';
import { SocketProvider } from './context/SocketContext';
import { VADProvider } from './context/VADContext';
import TranscribePage from './pages/TranscribePage';
import ChatPage from './pages/ChatPage';
import AdvisorPage from './pages/AdvisorPage';
import { Box } from '@mui/material';
import { GlobalProvider } from './context/GlobalContext';
  // palette: {
  //   mode: 'dark',
  //   primary: {
  //     main: '#5893df',
  //   },
  //   secondary: {
  //     main: '#2ec5d3',
  //   },
  //   background: {
  //     default: '#192231',
  //     paper: '#24344d'
  //   },
  // }
const theme = createTheme({
  palette: {
    primary: blue,
    secondary: teal
  },
});

const App = () => {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(location.pathname);
  const navigate = useNavigate();

  const handleRouteChange = (route) => {
    setCurrentTab(route);
    navigate(route);
  };

  return (
    <ThemeProvider theme={theme}>
      <SocketProvider>
        <GlobalProvider>
          <VADProvider currentTab={currentTab}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
              <ScribeBotAppBar currentTab={currentTab} setCurrentTab={handleRouteChange} />
              <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <Routes>
                  <Route path="/" element={<TranscribePage />} />
                  <Route path="/chat" element={<ChatPage />} />
                  <Route path="/advisor" element={<AdvisorPage />} />
                </Routes>
              </Box>
            </Box>
          </VADProvider>
        </GlobalProvider>
      </SocketProvider>
    </ThemeProvider>
  );
};

const AppWrapper = () => (
  <Router>
    <App />
  </Router>
);

export default AppWrapper;
