// src/components/TranscribeFeed.js
import React, { useState, useEffect, useContext } from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ChatIcon from '@mui/icons-material/Chat';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import { SocketContext } from '../context/SocketContext';
import { saveTranscript, saveAdvisorTranscript } from '../services/api';
import { useVADContext } from '../context/VADContext';
import './TranscribeFeed.css';
import ConversationHistory from './ConversationHistory';

const TranscribeFeed = ({ feedId, hideUserQuery, selectedAdvisor, selectedUser, selectedCaller, conversationHistory }) => {
  const [messages, setMessages] = useState([]);
  const { isProcessing, setIsProcessing } = useVADContext();
  const socket = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    const handleTranscription = (data) => {
      if (data.error) {
        console.error('Transcription error:', data.error);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          { type: 'transcription', content: data.transcription },
        ]);
        if (data.response) {
          setMessages((prevMessages) => [
            ...prevMessages,
            { type: 'response', content: data.response },
          ]);
        }
        console.log('Transcription:', data);
        setIsProcessing(false);
        if (feedId === 'advisor') {
          saveAdvisorTranscript({ advisorId: selectedAdvisor, userId: selectedUser, callerId: selectedCaller, ...data });
        } else {
          saveTranscript(data);
        }
      }
    };

    socket.on('transcription', handleTranscription);

    return () => {
      socket.off('transcription', handleTranscription);
    };
  }, [socket, feedId, setIsProcessing, selectedAdvisor, selectedUser, selectedCaller]);

  return (
    <div id={feedId} className="feed">
      {conversationHistory && conversationHistory.length > 0 && (<ConversationHistory conversationHistory={conversationHistory} />)}
      {messages.map((message, index) => (
        message.type === 'transcription' && hideUserQuery ? null : (
          <Box component="section"
            key={index}
            className={`message ${message.type === 'response' ? 'response' : 'transcription'} ${feedId === 'transcribe' ? 'italicious' : ''}`}
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(message.content)) }}
          />
        )
      ))}
      <Snackbar
        open={isProcessing}
        message="Advisor is thinking..."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
          <Alert
            severity="info"
            variant="filled"
            icon={
              feedId === 'advisor' ? <PsychologyIcon fontSize="inherit" /> : feedId === 'chat' ? <ChatIcon fontSize="inherit" /> : <HistoryEduIcon fontSize="inherit" />
            }
          >
            { feedId === 'advisor' ? 'Advisor is thinking...' : feedId === 'chat' ? 'Mulling things over...' : 'Scribbling notes...' }
          </Alert>
        </Snackbar>
    </div>
  );
};

export default TranscribeFeed;
