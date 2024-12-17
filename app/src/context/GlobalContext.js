import React, { createContext, useContext, useState } from 'react';

const GlobalContext = createContext();

export const useGlobal = () => useContext(GlobalContext);

export const GlobalProvider = ({ children }) => {
  const [selectedAdvisor, setSelectedAdvisor] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedCaller, setSelectedCaller] = useState('');

  return (
    <GlobalContext.Provider value={{ selectedAdvisor, setSelectedAdvisor, selectedUser, setSelectedUser, selectedCaller, setSelectedCaller }}>
      {children}
    </GlobalContext.Provider>
  );
};
