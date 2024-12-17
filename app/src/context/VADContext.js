import React, { createContext, useContext } from 'react';
import useVAD from '../hooks/useVAD';
import { SocketContext } from './SocketContext';

const VADContext = createContext();

export const useVADContext = () => useContext(VADContext);

export const VADProvider = ({ children, currentTab }) => {
  const socket = useContext(SocketContext);
  const { isListening, toggleListening, playlist, isProcessing, setIsProcessing } = useVAD(currentTab, socket);

  return (
    <VADContext.Provider value={{ isListening, toggleListening, playlist, isProcessing, setIsProcessing }}>
      {children}
    </VADContext.Provider>
  );
};
