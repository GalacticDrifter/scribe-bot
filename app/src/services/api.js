import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:5000';

// Function to save transcript
const saveTranscript = async (data) => {
  console.log('Saving transcript:', data);
  try {
    const response = await axios.post('/save_transcript', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

const getConversationHistory = async (data) => {
  console.log('Get conversation history:', data);
  try {
    const response = await axios.post('/get_conversation_history', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Success:', response.data);
    return response.data["conversation"];
  } catch (error) {
    console.error('Error:', error);
  }
};

// Function to save advisor transcript
const saveAdvisorTranscript = async (data) => {
  console.log('Saving advisor transcript:', data);
  try {
    const response = await axios.post('/save_advisor_transcript', data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.error('Error:', error);
  }
};

const getAdvisors = async () => {
  try {
    const response = await axios.get('/advisors');

    // Transform the response data
    const usersArray = Object.keys(response.data.advisors).map(advisorId => ({
      advisorId,
      ...response.data.advisors[advisorId],
    }));

    return usersArray;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch users...');
  }
};

const getUsers = async () => {
  try {
    const response = await axios.get('/users');

    // Transform the response data
    const usersArray = Object.keys(response.data.users).map(userId => ({
      userId,
      ...response.data.users[userId],
    }));

    return usersArray;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch users...');
  }
};

const getCallers = async () => {
  try {
    const response = await axios.get('/customers');

    // Transform the response data
    const callersArray = Object.keys(response.data.customers).map(callerId => ({
      callerId,
      ...response.data.customers[callerId],
    }));

    return callersArray;
  } catch (error) {
    console.error('Error:', error);
    throw new Error('Failed to fetch callers...');
  }
};

const sendAudioToBackend = async (formData) => {
  try {
    const response = await axios.post('/api/whisper-transcribe', formData);
    console.log('Success:', response.data);
    return response.data
  } catch (error) {
    console.error('Error sending audio to backend:', error);
  }
};

export { getAdvisors, getUsers, getCallers, saveTranscript, saveAdvisorTranscript, getConversationHistory, sendAudioToBackend };