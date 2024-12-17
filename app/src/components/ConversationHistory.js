// src/components/TranscribeFeed.js
import React from 'react';
import { Box, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import './TranscribeFeed.css';

const ConversationHistory = ({ conversationHistory }) => {
    return (
        <Accordion variant='outlined'>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="ConversationHistory-header"
            >
                Conversation History
            </AccordionSummary>
            <AccordionDetails style={{ maxHeight: '40vh', overflowY: 'auto' }}>
                {conversationHistory.map((message, index) => (
                    <Box key={index}>
                        <Box component="section"
                            key={`${index}-transcription`}
                            className={`message transcription`}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(message.callerTranscription)) }}
                        />
                        <Box component="section"
                            key={`${index}-response`}
                            className={`message response`}
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(message.advisorResponse)) }}
                        />
                    </Box>
                ))}
            </AccordionDetails>
        </Accordion>

    );
};

export default ConversationHistory;
