// hooks/useVAD.js
import { useState } from 'react';
import { useMicVAD, utils } from '@ricky0123/vad-react';
import { interpolateInferno } from 'd3-scale-chromatic';
import { useGlobal } from '../context/GlobalContext';
import { sendAudioToBackend } from '../services/api';

const useVAD = (currentTab, socket) => {
  const [isListening, setIsListening] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const { selectedAdvisor, selectedUser, selectedCaller } = useGlobal();

  const addToPlaylist = (url) => {
    setPlaylist((prevPlaylist) => [url, ...prevPlaylist]);
  };

  const vad = useMicVAD({
    positiveSpeechThreshold: 0.8,
    minSpeechFrames: 5,
    maxSpeechFrames: 1650,
    preSpeechPadFrames: 10,
    redemptionFrames: 15,
    onSpeechStart: () => {
      console.log('Speech started');
    },
    onFrameProcessed: (probs) => {
      const indicatorColor = interpolateInferno(probs.isSpeech / 2);
      document.body.style.setProperty("--indicator-color", indicatorColor);
    },
    onSpeechEnd: (arr) => {
      console.log('Speech ended');
      const wavBuffer = utils.encodeWAV(arr);
      const base64 = utils.arrayBufferToBase64(wavBuffer);
      const url = `data:audio/wav;base64,${base64}`;
      addToPlaylist(url);

      const emitEvent = currentTab === '/chat' ? 'chat_stream' : currentTab === '/advisor' ? 'advisor_stream' : 'transcribe_stream';
      const advisorData = { advisorId: selectedAdvisor, userId: selectedUser, callerId: selectedCaller, audio: wavBuffer };
      
      socket.emit(emitEvent, currentTab === '/advisor' ? advisorData : wavBuffer);

      setIsProcessing(true);
    },
  });

  const toggleListening = () => {
    if (vad) {
      if (isListening) {
        vad.pause();
      } else {
        vad.start();
      }
      setIsListening(!isListening);
    }
  };

  return { isListening, toggleListening, playlist, isProcessing, setIsProcessing };
};

export default useVAD;
