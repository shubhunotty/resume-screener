import { createContext, useContext, useState } from 'react';

const RefreshContext = createContext();

export const useRefresh = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }) => {
  const [refreshToken, setRefreshToken] = useState(0);

  const triggerRefresh = () => setRefreshToken((prev) => prev + 1);

  return (
    <RefreshContext.Provider value={{ refreshToken, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};
