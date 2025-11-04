import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthInProgress, setAuthInProgress] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthInProgress, setAuthInProgress }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
